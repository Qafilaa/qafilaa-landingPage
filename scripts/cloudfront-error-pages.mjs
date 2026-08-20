#!/usr/bin/env node
/**
 * Point CloudFront at dist/404.html for missing pages.
 *
 * Why both 403 and 404: the distribution uses a REST S3 origin (OAC), so a
 * request for a key that does not exist comes back as `403 AccessDenied` in
 * application/xml — not a 404. Without these rules every typo'd URL, and every
 * store reviewer who mistypes a policy link, gets CloudFront's bare XML error
 * instead of a page with a way back.
 *
 * Idempotent: it reads the live config, applies the two rules, and only calls
 * update-distribution if something actually changed. Safe to re-run.
 *
 *   AWS_PROFILE=qafilaa CLOUDFRONT_DISTRIBUTION_ID=E123... npm run cloudfront:errors
 *   npm run cloudfront:errors -- --dry-run
 *
 * Needs cloudfront:GetDistributionConfig and cloudfront:UpdateDistribution.
 * The deploy user only has CreateInvalidation, which is deliberate — this is a
 * one-off configuration change, not something CI should hold the keys for.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry-run');

/** The site this script is for. Used to find the distribution when no id is given. */
const SITE_ALIAS = 'qafilaa.in';

/** The page CloudFront should serve, and the status the browser should see. */
const WANTED = [
  {
    ErrorCode: 403,
    ResponsePagePath: '/404.html',
    ResponseCode: '404',
    // Short, so a page that is added later is not remembered as missing for
    // long. The deploy invalidates /* anyway; this is the belt to that braces.
    ErrorCachingMinTTL: 60,
  },
  {
    ErrorCode: 404,
    ResponsePagePath: '/404.html',
    ResponseCode: '404',
    ErrorCachingMinTTL: 60,
  },
];

function aws(args) {
  return execFileSync('aws', args, { encoding: 'utf-8', maxBuffer: 32 * 1024 * 1024 });
}

/**
 * Find the distribution by its alias, so nobody has to look an id up.
 * The account holds more than one distribution, so matching on the alias also
 * means this can never reconfigure somebody else's site by accident.
 */
function findDistribution() {
  if (process.env.CLOUDFRONT_DISTRIBUTION_ID) return process.env.CLOUDFRONT_DISTRIBUTION_ID;

  let list;
  try {
    list = JSON.parse(aws(['cloudfront', 'list-distributions', '--output', 'json']));
  } catch (err) {
    console.error('Could not list distributions. Is the AWS CLI configured?');
    console.error(String(err.stderr || err.message).trim());
    process.exit(1);
  }

  const items = list.DistributionList?.Items ?? [];
  const hits = items.filter((d) =>
    (d.Aliases?.Items ?? []).some((a) => a === SITE_ALIAS || a === `www.${SITE_ALIAS}`),
  );
  if (hits.length !== 1) {
    console.error(`Expected exactly one distribution aliased to ${SITE_ALIAS}, found ${hits.length}.`);
    console.error('Set CLOUDFRONT_DISTRIBUTION_ID explicitly to choose.');
    process.exit(1);
  }
  console.log(`Matched ${hits[0].Id} by alias ${SITE_ALIAS} (${hits[0].DomainName}).`);
  return hits[0].Id;
}

const DIST_ID = findDistribution();

let raw;
try {
  raw = aws(['cloudfront', 'get-distribution-config', '--id', DIST_ID, '--output', 'json']);
} catch (err) {
  console.error(`Could not read distribution ${DIST_ID}.`);
  console.error('Check the id, your credentials, and that the identity has cloudfront:GetDistributionConfig.');
  console.error(String(err.stderr || err.message).trim());
  process.exit(1);
}

const { ETag, DistributionConfig: config } = JSON.parse(raw);

const existing = config.CustomErrorResponses?.Items ?? [];
console.log(`Distribution ${DIST_ID} currently has ${existing.length} custom error response(s):`);
for (const r of existing) {
  console.log(`  ${r.ErrorCode} -> ${r.ResponsePagePath ?? '(none)'} as ${r.ResponseCode ?? r.ErrorCode}, ttl ${r.ErrorCachingMinTTL}`);
}

// Keep any rule we are not managing (500s, 502s, whatever they have added).
const untouched = existing.filter((r) => !WANTED.some((w) => w.ErrorCode === r.ErrorCode));
const merged = [...untouched, ...WANTED].sort((a, b) => a.ErrorCode - b.ErrorCode);

const same =
  merged.length === existing.length &&
  merged.every((want) => {
    const has = existing.find((r) => r.ErrorCode === want.ErrorCode);
    return (
      has &&
      has.ResponsePagePath === want.ResponsePagePath &&
      String(has.ResponseCode) === String(want.ResponseCode) &&
      Number(has.ErrorCachingMinTTL) === Number(want.ErrorCachingMinTTL)
    );
  });

if (same) {
  console.log('\nAlready configured. Nothing to do.');
  process.exit(0);
}

console.log('\nWill set:');
for (const r of merged) {
  const isNew = !existing.some((e) => e.ErrorCode === r.ErrorCode);
  console.log(`  ${isNew ? '+' : '~'} ${r.ErrorCode} -> ${r.ResponsePagePath} as ${r.ResponseCode}, ttl ${r.ErrorCachingMinTTL}`);
}

config.CustomErrorResponses = { Quantity: merged.length, Items: merged };

if (DRY) {
  console.log('\n--dry-run: not calling update-distribution.');
  process.exit(0);
}

const file = join(mkdtempSync(join(tmpdir(), 'qafilaa-cf-')), 'distribution-config.json');
writeFileSync(file, JSON.stringify(config));

try {
  aws([
    'cloudfront',
    'update-distribution',
    '--id',
    DIST_ID,
    '--if-match',
    ETag,
    '--distribution-config',
    `file://${file}`,
    '--output',
    'json',
  ]);
} catch (err) {
  console.error('\nupdate-distribution failed.');
  console.error(String(err.stderr || err.message).trim());
  process.exit(1);
}

console.log('\nUpdated. CloudFront takes a few minutes to redeploy to every edge.');
console.log('Then check:');
console.log('  curl -sI https://qafilaa.in/definitely-not-a-page | head -3   # expect 404, text/html');
console.log('  curl -s  https://qafilaa.in/definitely-not-a-page | grep -o "not on the map"');
