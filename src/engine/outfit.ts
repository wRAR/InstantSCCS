import { OutfitSpec } from "grimoire-kolmafia";
import {
  cliExecute,
  equip,
  equippedItem,
  Familiar,
  familiarWeight,
  Item,
  itemAmount,
  toInt,
} from "kolmafia";
import { $familiar, $familiars, $item, $skill, $slot, get, have, maxBy } from "libram";
import { haveCBBIngredients } from "../lib";

export function garbageShirt(): void {
  if (
    have($item`January's Garbage Tote`) &&
    get("garbageShirtCharge") > 0 &&
    have($skill`Torso Awareness`)
  ) {
    if (get("garbageShirtCharge") === 1) {
      if (equippedItem($slot`shirt`) === $item`makeshift garbage shirt`)
        equip($slot`shirt`, $item.none);
    } else {
      if (!have($item`makeshift garbage shirt`)) cliExecute("fold makeshift garbage shirt");
      equip($slot`shirt`, $item`makeshift garbage shirt`);
    }
  }
}

export function unbreakableUmbrella(): void {
  if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
    cliExecute("umbrella ml");
}

export function docBag(): void {
  if (
    have($item`Lil' Doctor™ bag`) &&
    get("_chestXRayUsed") < 3 &&
    !get("instant_saveDocBag", false)
  )
    equip($slot`acc3`, $item`Lil' Doctor™ bag`);
}

export function sugarItemsAboutToBreak(): Item[] {
  const sugarItems = [
    { id: 4180, item: $item`sugar shank` },
    { id: 4181, item: $item`sugar chapeau` },
    { id: 4182, item: $item`sugar shorts` },
  ];
  return sugarItems
    .map((entry) => {
      const { id, item } = entry;
      const itemAboutToBreak = parseInt(get(`sugarCounter${id.toString()}`), 10) >= 30;
      return itemAboutToBreak ? [item] : [];
    })
    .reduce((a, b) => a.concat(b))
    .concat([$item`sugar shield`]);
}

function nanorhino(allowAttackingFamiliars = false): Familiar {
  return allowAttackingFamiliars && get("_nanorhinoCharge", 0) === 100
    ? $familiar`Nanorhino`
    : $familiar.none;
}

function cookbookbat(): Familiar {
  return !haveCBBIngredients(true) ? $familiar`Cookbookbat` : $familiar.none;
}

function shorterOrderCook(allowAttackingFamiliars = true): Familiar {
  return allowAttackingFamiliars &&
    !have($item`short stack of pancakes`) &&
    get("_shortOrderCookCharge") - itemAmount($item`battle broom`) <= 10
    ? $familiar`Shorter-Order Cook`
    : $familiar.none;
}

function garbageFire(): Familiar {
  return !have($item`burning newspaper`) ? $familiar`Garbage Fire` : $familiar.none;
}

function sombrero(allowAttackingFamiliars = true): Familiar {
  const sombreros = [
    allowAttackingFamiliars ? $familiar`Galloping Grill` : $familiar.none,
    $familiar`Baby Sandworm`,
    $familiar`Hovering Sombrero`,
  ].filter((fam) => have(fam));
  return sombreros.length > 0 ? sombreros[0] : $familiar.none;
}

function rockinRobin(): Familiar {
  return !have($item`robin's egg`) ? $familiar`Rockin' Robin` : $familiar.none;
}

function optimisticCandle(): Familiar {
  return !have($item`glob of melted wax`) ? $familiar`Optimistic Candle` : $familiar.none;
}

export function chooseFamiliar(allowAttackingFamiliars = true): Familiar {
  const ignoredFamiliars = get("instant_explicitlyExcludedFamiliars", "")
    .split(",")
    .map((i) => toInt(i));
  const defaultFam = have($familiar`Cookbookbat`) ? $familiar`Cookbookbat` : $familiar.none;
  const familiars = [
    cookbookbat,
    shorterOrderCook,
    garbageFire,
    nanorhino,
    optimisticCandle,
    rockinRobin,
    sombrero,
  ]
    .map((fn) => fn(allowAttackingFamiliars))
    .filter((fam) => have(fam) && !ignoredFamiliars.includes(toInt(fam)));
  return familiars.length > 0 ? familiars[0] : defaultFam;
}

const specialEquipFamiliars = $familiars`Disembodied Hand, Left-Hand Man, Mad Hatrack, Fancypants Scarecrow, Ghost of Crimbo Carols, Ghost of Crimbo Cheer, Ghost of Crimbo Commerce`;
export function chooseHeaviestFamiliar(): Familiar {
  return maxBy(
    Familiar.all().filter((fam) => have(fam) && !specialEquipFamiliars.includes(fam)),
    (fam) => fam.experience
  );
}

export function baseOutfit(allowAttackingFamiliars = true): OutfitSpec {
  // Only try equipping/nag LOV Epaulettes if we are done with the LOV tunnel
  const lovTunnelCompleted = get("_loveTunnelUsed") || !get("loveTunnelAvailable");
  return {
    offhand: $item`unbreakable umbrella`,
    back: lovTunnelCompleted ? $item`LOV Epaulettes` : undefined,
    acc1: $item`codpiece`,
    familiar: chooseFamiliar(allowAttackingFamiliars),
    modifier: "0.25 mys, 0.33 ML, -equip tinsel tights, -equip wad of used tape",
    avoid: sugarItemsAboutToBreak(),
  };
}
