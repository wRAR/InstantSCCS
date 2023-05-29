# Fork description

This is a fork of `InstantSCCS` tailored to my account, [wRAR (#1267204)](https://api.aventuristo.net/av-snapshot?u=wRAR). It uses some additional things I have and makes different decisions where it's better for my account. It may not work for you at all, or not better than the vanilla `InstantSCCS`, but you may find some of the changes useful and make your own fork.

Note that the branch is always rebased, not merged. It's also not autobuilt. The changes are separated into their own, mostly self-contained, commits. You may consider this branch a patch set, not a fork.

# Requirements and assumptions

## General

I spend about 2 turns on leveling so this script assumes that it's fine to cast various buffs early.

I cap the item, NC and hotres tests and almost cap the wdmg test so this script assumes that certain buffs survive these tests and that some resources don't need to be spent on them.

## Valhalla

I don't take the [astral pet sweater](https://kol.coldfront.net/thekolwiki/index.php/Astral_pet_sweater) as it's replaced by the [sugar shield](https://kol.coldfront.net/thekolwiki/index.php/Sugar_shield). Instead, I take [astral trousers](https://kol.coldfront.net/thekolwiki/index.php/Astral_trousers).

## Pulls

The script tries to pull [wasabi marble soda](https://kol.coldfront.net/thekolwiki/index.php/Wasabi_marble_soda) as the last pull. It should be optional though.

## Familiars

I skip all or almost all crafted Cookbookbat foods so I need either 0 or 11 Cookbookbat combats (11 if eating a [roasted vegetable of Jarlsberg](https://kol.coldfront.net/thekolwiki/index.php/Roasted_vegetable_of_Jarlsberg) for the item test). The rest of the familiar turns go to other familiars and there is no overleveling while waiting for Cookbookbat drops.

## Prefs

The script assumes that certain prefs are set and will likely run badly even on my account if they aren't. Here are my current prefs:

```
instant_saveAbstraction=true
instant_saveAstralPilsners=3
instant_saveBackups=11
instant_saveBeesKnees=true
instant_saveBorisBeer=true
instant_saveBorisBread=true
instant_saveEuclideanAngle=true
instant_saveFortuneTeller=true
instant_saveFreeRests=0
instant_saveHoneyBun=true
instant_saveLocketFactoryWorker=true
instant_saveLocketIceConcierge=true
instant_savePerfectFreeze=true
instant_savePlainCalzone=true
instant_savePorquoise=true
instant_saveRichRicotta=true
instant_saveRicottaCasserole=true
instant_saveRoastedVegetableItem=true
instant_saveRoastedVegetableStats=true
instant_saveWileyWheyBar=true
instant_skipDistilledFortifiedWine=true
instant_skipEarlyTrainsetMeat=true
instant_targetBaseMyst=194
instant_targetBaseMystGap=110
```

Out of these, `instant_saveLocketIceConcierge` and `instant_saveBorisBread` disable code added by this fork. You can remove the code instead.

There are other new prefs, `instant_saveLectures` for the goblin profchain and `instant_saveLocketWitchessWitch` for the Witch locket.

# Changes

## Test order

The new test order is

1. Mysticality
2. HP
3. Moxie
4. Muscle
5. Weapon Damage
6. Spell Damage
7. Familiar Weight
8. Non-Combat
9. Hot Resistance
10. Item Drop

Thus, the wdmg and sdmg tests are moved right after the stat tests to use a wished [Spit Upon](https://kol.coldfront.net/thekolwiki/index.php/Spit_Upon) for all of them, and the item test is moved to the last position to be able to safely use [Feeling Lost](https://kol.coldfront.net/thekolwiki/index.php/Feeling_Lost).

Some things that are done before some test to be used in another test are accordingly reshuffled.

## Additional things used

- Jurassic Parka for a turn-free YR, to save a pre-coil turn.
- Libram of Love Songs for several tests.
- Cosplay Saber as a YR replacement because ELY doesn't wear off.
- Wasabi marble soda pull for wdmg.
- (unused) ice concierge locket for exotic travel brochure (+exp%).
- Witchess Witch locket for battle broom (+mys, +sdmg, +mys exp).
- designer sweatpants for hotres.
- Summon Crimbo Candy for minor buffs for stat tests.
- Pocket Professor for more sausage goblin fights.
- Feel Nostalgic for 3 more sausages.
- Spit Upon wish for leveling and several tests.
- Frosty wish for item drop.
- Various permable and IotM effects here and there.

## Major logic changes

### MP usage

The script burns a lot of MP on love song summons and some MP on additional buffs.

### Sugar item usage

The sugar code is modified to get a sugar shield instead of a sugar shank. The shield is only equipped when needed to get more stillsuit turns.

### Pre-coil

The script aims for 0 turns spent pre-coil. So no early train meat, no getting DFW (but it also doesn't need it!) and a zero-turn skeleton fruits via a parka YR.

The deck summons for two meltable weapons are removed.

Fortune teller consults with Cheesefax are added.

### Leveling

Some buffs used in stat tests are cast early as leveling takes almost 0 turns.

An ice concierge locket is added (and disabled) to get an exotic travel brochure.

One snokebomb is saved for wdmg.

A Witchess Witch locket is added to get a battle broom. Caution: it's easy to lose it even with a saber if you don't have enough other things and likely guaranteed without it.

The red skeleton locket moved to stat tests.

The second (first after coil) sausage goblin fight is chained with the Pocket Professor.

### Stat tests

The red skeleton is fought between mox and mus tests to optimize the locket enchantments.

Summon Crimbo Candy is cast for Sugar Rush and maybe +mus/+mox effects.

Pocket maze usage moved from the hotres test.

Many minor buffs are added.

### Wdmg/sdmg tests

Wasabi marble soda is pulled.

Deep Dark Visions is cast before wdmg to be used in sdmg.

Ungulith is fought before wdmg instead of item because of test reordering.

Kung Fu Fighting is acquired in The Dire Warren using a snokebomb.

### Hotres test

Pocket maze usage moved to the moxie test. Silver face paint usage is skipped.

### Item test

The script doesn't get cyclops eyedrops.

Ungulith is fought in wdmg instead of item because of test reordering.

Feeling Lost is acquired as this is the last test. Frosty is wished for as this is the last test that takes 1 turn so most if it remains for aftercore.
