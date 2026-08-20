import { Chrome } from './site/chrome/Chrome';
import { Shortcuts } from './site/chrome/Shortcuts';
import {
  AlongTheWay,
  BringTheCrew,
  DayWisePlan,
  EndOfTheRide,
  LiveConvoy,
  Navigation,
  NoSignal,
  Notes,
  PapersAndLists,
  Permissions,
  PlanTheTrip,
  RollOut,
  Safety,
  SetUpOnce,
  SettingsAndSupport,
  TheEnd,
  TheLobby,
  TheMoney,
  TheSendOff,
  TheSplit,
  Trailhead,
  WhereYouSleep,
} from './site/sections';
import { useSiteEngine } from './site/useSiteEngine';

/**
 * The landing page: 22 waypoints down the Manali-Leh-Manali circuit.
 *
 * The markup here is the static half of the design; `useSiteEngine()` mounts the
 * runtime that supplies the tone system, the flying phone and every demo. That
 * runtime owns this subtree once it boots, so this component must stay
 * stateless — a re-render would discard everything it has drawn.
 */
export function Landing() {
  const ref = useSiteEngine();

  return (
    <div id="qf-site" data-app="1" ref={ref} style={{ position: 'relative' }}>
      <Chrome />

      <Trailhead />
      <TheSplit />
      <SetUpOnce />
      <Permissions />
      <TheSendOff />
      <PlanTheTrip />
      <BringTheCrew />
      <DayWisePlan />
      <WhereYouSleep />
      <TheMoney />
      <PapersAndLists />
      <Notes />
      <AlongTheWay />
      <TheLobby />
      <RollOut />
      <LiveConvoy />
      <Navigation />
      <Safety />
      <NoSignal />
      <SettingsAndSupport />
      <EndOfTheRide />
      <TheEnd />

      <Shortcuts />
    </div>
  );
}
