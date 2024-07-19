import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  create,
  Effect,
  elementalResistance,
  equip,
  equippedItem,
  faxbot,
  haveEffect,
  haveEquipped,
  inebrietyLimit,
  myBasestat,
  myClass,
  myHash,
  myHp,
  myInebriety,
  myMaxhp,
  myMeat,
  myThrall,
  numericModifier,
  outfit,
  print,
  restoreHp,
  restoreMp,
  retrieveItem,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $element,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  $stat,
  $thrall,
  clamp,
  Clan,
  CommunityService,
  DaylightShavings,
  get,
  have,
  SongBoom,
} from "libram";
import Macro, { haveFreeBanish, haveMotherSlimeBanish } from "../combat";
import { sugarItemsAboutToBreak } from "../outfit";
import { Quest } from "../engine/task";
import {
  handleCustomPulls,
  logTestSetup,
  motherSlimeClan,
  startingClan,
  tryAcquiringEffect,
  wishFor,
} from "../lib";
import { powerlevelingLocation } from "./leveling";
import { forbiddenEffects } from "../resources";
import { chooseFamiliar } from "../familiars";

const attemptKFH = have($skill`Kung Fu Hustler`) && have($familiar`Disembodied Hand`);
const wpnTestMaximizerString = "weapon dmg, switch disembodied hand, -switch left-hand man";

export const WeaponDamageQuest: Quest = {
  name: "Weapon Damage",
  completed: () => CommunityService.WeaponDamage.isDone(),
  tasks: [
    {
      name: "Drink Sockdollager",
      completed: () =>
        have($effect`In a Lather`) ||
        myInebriety() >= inebrietyLimit() - 1 ||
        myMeat() < 500 ||
        get("instant_saveSockdollager", false),
      do: (): void => {
        tryAcquiringEffect($effect`Ode to Booze`);
        visitUrl(`clan_viplounge.php?preaction=speakeasydrink&drink=6&pwd=${+myHash()}`); // Sockdollager
      },
      limit: { tries: 1 },
    },
    {
      name: "Potion of Potency",
      completed: () =>
        have($item`potion of potency`) ||
        have($effect`Pronounced Potency`) ||
        !have($item`scrumptious reagent`) ||
        !have($item`orange`),
      do: () => create($item`potion of potency`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Carol Ghost Buff",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      completed: () =>
        !have($familiar`Ghost of Crimbo Carols`) ||
        !haveFreeBanish() ||
        $effects`Do You Crush What I Crush?, Holiday Yoked, Let It Snow/Boil/Stink/Frighten/Grease, All I Want For Crimbo Is Stuff, Crimbo Wrapping`.some(
          (ef) => have(ef),
        ),
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(Macro.banish().abort()),
      outfit: {
        offhand: $item`latte lovers member's mug`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Ghost of Crimbo Carols`,
        famequip: $item.none,
      },
      limit: { tries: 1 },
    },
    {
      name: "Inner Elf",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
        Clan.join(motherSlimeClan);
      },
      completed: () =>
        !have($familiar`Machine Elf`) ||
        !haveMotherSlimeBanish() ||
        have($effect`Inner Elf`) ||
        motherSlimeClan === "",
      do: $location`The Slime Tube`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`KGB tranquilizer dart`)
          .trySkill($skill`Snokebomb`)
          .abort(),
      ),
      choices: { 326: 1 },
      outfit: {
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Eight Days a Week Pill Keeper`, // survive first hit if it occurs
        familiar: $familiar`Machine Elf`,
        modifier: "HP",
      },
      post: () => Clan.join(startingClan),
      limit: { tries: 1 },
    },
    {
      name: "Glob of Melted Wax",
      completed: () => !have($item`glob of melted wax`) || have($item`wax hand`),
      do: (): void => {
        visitUrl("inv_use.php?whichitem=9310&which=3&pwd");
        visitUrl("choice.php?whichchoice=1218&option=2&pwd");
        visitUrl("main.php");
      },
      limit: { tries: 1 },
    },
    {
      name: "Meteor Shower",
      completed: () =>
        have($effect`Meteor Showered`) ||
        !have($item`Fourth of May Cosplay Saber`) ||
        !have($skill`Meteor Lore`) ||
        get("_saberForceUses") >= 5,
      do: attemptKFH ? powerlevelingLocation() : $location`The Dire Warren`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Meteor Shower`)
          .trySkill($skill`%fn, spit on me!`)
          .trySkill($skill`Use the Force`)
          .abort(),
      ),
      outfit: (): OutfitSpec => {
        return attemptKFH
          ? {
              weapon: $item.none,
              offhand: $item.none,
              familiar: $familiar`Disembodied Hand`,
              famequip: $item`Fourth of May Cosplay Saber`,
              avoid: sugarItemsAboutToBreak(),
            }
          : {
              weapon: $item`Fourth of May Cosplay Saber`,
              familiar: get("camelSpit") >= 100 ? $familiar`Melodramedary` : chooseFamiliar(false),
              avoid: sugarItemsAboutToBreak(),
            };
      },
      choices: { 1387: 3 },
      limit: { tries: 1 },
    },
    {
      name: "Favorite Bird (Weapon Damage)",
      completed: () =>
        !have($skill`Visit your Favorite Bird`) ||
        get("_favoriteBirdVisited") ||
        !get("yourFavoriteBirdMods").includes("Weapon Damage") ||
        get("instant_saveFavoriteBird", false),
      do: () => useSkill($skill`Visit your Favorite Bird`),
      limit: { tries: 1 },
    },
    {
      name: "Stick-Knife Trick",
      ready: () =>
        get("instant_stickKnifeOutfit") !== "" &&
        myClass() === $class`Pastamancer` &&
        have($item`Stick-Knife of Loathing`) &&
        (have($skill`Bind Undead Elbow Macaroni`) || myThrall() === $thrall`Undead Elbow Macaroni`),
      completed: () =>
        haveEquipped($item`Stick-Knife of Loathing`) ||
        have($familiar`Disembodied Hand`) ||
        myBasestat($stat`Mysticality`) < 150 ||
        myBasestat($stat`Muscle`) >= 150,
      do: (): void => {
        if (myThrall() !== $thrall`Undead Elbow Macaroni`)
          useSkill($skill`Bind Undead Elbow Macaroni`);
        outfit(get("instant_stickKnifeOutfit"));
      },
      limit: { tries: 1 },
    },
    {
      name: "Fax Ungulith",
      completed: () => get("_photocopyUsed") || have($item`corrupted marrow`),
      do: (): void => {
        if (have($item`photocopied monster`) && get("photocopyMonster") !== $monster`ungulith`) {
          cliExecute("fax send");
        }

        // If we're whitelisted to the CSLooping clan, use that to grab the ungulith instead
        if (Clan.getWhitelisted().find((c) => c.name.toLowerCase() === "csloopers unite")) {
          Clan.with("CSLoopers Unite", () => cliExecute("fax receive"));
        } else {
          if (!visitUrl("messages.php?box=Outbox").includes("#3626664")) {
            print("Requesting whitelist to CS clan...", "blue");
            cliExecute("csend to 3626664 || Requesting access to CS clan");
          }
          cliExecute("chat");
        }

        if (
          (have($item`photocopied monster`) || faxbot($monster`ungulith`)) &&
          get("photocopyMonster") === $monster`ungulith`
        ) {
          use($item`photocopied monster`);
        }
      },
      outfit: () => ({
        hat:
          DaylightShavings.nextBuff() === $effect`Musician's Musician's Moustache` &&
          !DaylightShavings.hasBuff() &&
          have($item`Daylight Shavings Helmet`)
            ? $item`Daylight Shavings Helmet`
            : undefined,
        back: $item`vampyric cloake`,
        weapon: $item`Fourth of May Cosplay Saber`,
        offhand: have($skill`Double-Fisted Skull Smashing`)
          ? $item`industrial fire extinguisher`
          : undefined,
        familiar: chooseFamiliar(false),
        modifier: "myst",
        avoid: sugarItemsAboutToBreak(),
      }),
      choices: { 1387: 3 },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Become a Bat`)
          .trySkill($skill`Fire Extinguisher: Polar Vortex`)
          .trySkill($skill`Use the Force`)
          .default(),
      ),
      limit: { tries: 5 },
    },
    {
      name: "Kung Fu",
      prepare: (): void => {
        restoreMp(50);
        equip($slot`weapon`, $item.none);
        equip($slot`offhand`, $item.none);
      },
      completed: () =>
        have($effect`Kung Fu Fighting`) ||
        get("_snokebombUsed") >= 3 ||
        !have($skill`Kung Fu Hustler`) ||
        !have($skill`Snokebomb`),
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Snokebomb`).abort()),
      outfit: () => ({
        avoid: sugarItemsAboutToBreak(),
      }),
      limit: { tries: 1 },
    },
    {
      name: "Cast Deep Dark Visions",
      // you need more turns of the effect than your wdmg test length
      completed: () =>
        have($effect`Cowrruption`) ||
        haveEffect($effect`Visions of the Deep Dark Deeps`) >= 5 ||
        !have($skill`Deep Dark Visions`),
      do: (): void => {
        const resist = 1 - elementalResistance($element`spooky`) / 100;
        const neededHp = Math.max(500, myMaxhp() * 4 * resist);
        if (myMaxhp() < neededHp) throw `Not enough HP for Deep Dark Visions.`;
        while (myHp() < neededHp) useSkill($skill`Cannelloni Cocoon`);
        useSkill($skill`Deep Dark Visions`);
      },
      outfit: { modifier: "HP 500max, Spooky Resistance", familiar: $familiar`Exotic Parrot` },
      effects: $effects`Astral Shell, Elemental Saucesphere`,
      limit: { tries: 3 },
    },
    {
      name: "Test",
      prepare: (): void => {
        if (have($item`SongBoom™ BoomBox`)) SongBoom.setSong("These Fists Were Made for Punchin'");
        if (!have($item`goofily-plumed helmet`)) buy($item`goofily-plumed helmet`, 1);
        if (
          have($item`Ye Wizard's Shack snack voucher`) &&
          !forbiddenEffects.includes($effect`Wasabi With You`)
        )
          retrieveItem($item`wasabi marble soda`);
        const usefulEffects: Effect[] = [
          $effect`Barrel Chested`,
          $effect`Billiards Belligerence`,
          $effect`Bow-Legged Swagger`,
          $effect`Carol of the Bulls`,
          $effect`Cowrruption`,
          $effect`Destructive Resolve`,
          $effect`Disdain of the War Snapper`,
          $effect`Faboooo`,
          $effect`Feeling Punchy`,
          $effect`Frenzied, Bloody`,
          $effect`Imported Strength`,
          $effect`Jackasses' Symphony of Destruction`,
          $effect`Lack of Body-Building`,
          $effect`Pronounced Potency`,
          $effect`Rage of the Reindeer`,
          $effect`Rictus of Yeg`,
          $effect`Seeing Red`,
          $effect`Scowl of the Auk`,
          $effect`Song of the North`,
          $effect`Tenacity of the Snapper`,
          $effect`The Power of LOV`,
          $effect`Wasabi With You`,
          $effect`Weapon of Mass Destruction`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));
        handleCustomPulls("instant_weaponTestPulls", wpnTestMaximizerString);

        if (
          have($skill`Aug. 13th: Left/Off Hander's Day!`) &&
          !get("instant_saveAugustScepter", false) &&
          numericModifier(equippedItem($slot`off-hand`), "Weapon Damage") +
            numericModifier(equippedItem($slot`off-hand`), "Weapon Damage Percent") >
            0 &&
          CommunityService.WeaponDamage.actualCost() > 1
        ) {
          tryAcquiringEffect($effect`Offhand Remarkable`);
        }

        // If it saves us >= 6 turns, try using a wish
        if (CommunityService.WeaponDamage.actualCost() >= 7) wishFor($effect`Outer Wolf™`);
        $effects`Spit Upon, Pyramid Power`.forEach((ef) => {
          if (CommunityService.WeaponDamage.actualCost() >= 5) wishFor(ef); // The effects each save 2 turns on spelltest as well
        });

        if (
          !have($effect`Rictus of Yeg`) &&
          CommunityService.WeaponDamage.actualCost() >= 5 &&
          !get("_cargoPocketEmptied") &&
          have($item`Cargo Cultist Shorts`) &&
          !get("instant_saveCargoShorts", false)
        ) {
          visitUrl("inventory.php?action=pocket");
          visitUrl("choice.php?whichchoice=1420&option=1&pocket=284");
          tryAcquiringEffect($effect`Rictus of Yeg`);
        }
      },
      completed: () => CommunityService.WeaponDamage.isDone(),
      do: (): void => {
        const maxTurns = get("instant_wpnTestTurnLimit", 35);
        const testTurns = CommunityService.WeaponDamage.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print(
            "You may also increase the turn limit by typing 'set instant_wpnTestTurnLimit=<new limit>'",
            "red",
          );
        }
        CommunityService.WeaponDamage.run(
          () => logTestSetup(CommunityService.WeaponDamage),
          maxTurns,
        );
      },
      outfit: { modifier: wpnTestMaximizerString },
      limit: { tries: 1 },
    },
  ],
};
