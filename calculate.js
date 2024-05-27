function calculateDamage() {
  Promise.all([
    fetch('gunstyles.json').then(response => response.json()),
    fetch('PLMulti.json').then(response => response.json())
  ])
    .then(([gunData, PLMulti]) => {
      const category = document.getElementById('weaponCategory').value;
      const style = document.getElementById('weaponStyle').value;
      const selectedGun = gunData[category].find(gun => gun.frame === style);

      activitytype = document.getElementById('activityType').value;
      activity = document.getElementById('activity').value;
      difficulty = document.getElementById('difficulty').value;  // this is either RAD, normal, or master
      if (activitytype == '') {
        activitytype = 'Dungeons'
      }
      if (activity == '') {
        activity = 'GoA - Phry\'zia'
      }
      if (difficulty == '') {
        difficulty = 'normal'
      }

      const weaponPL = parseFloat(document.getElementById('weaponPL').value);
      const armorPL = parseFloat(document.getElementById('armorPL').value);
      const totalPL = parseFloat(document.getElementById('totalPL').value);

      let PLMultiValue = 1.0;

      const selectedActivity = PLMulti[activitytype][activity];
      const recommendedPL = parseFloat(selectedActivity["Recommended Power Level"]);
      const recomendedPLMulti = parseFloat(selectedActivity["Recommended PL Multiplier"].replace('x', ''));


      // Calculate Gear ePL Delta
      const gearDelta = totalPL - recommendedPL;
      console.log(gearDelta);
      const gearMultiplier = getGearMultiplier(gearDelta, difficulty);
      console.log(gearMultiplier);

      // Calculate Weapon ePL Delta
      const weaponDelta = weaponPL - recommendedPL;
      console.log(weaponDelta);
      const weaponMultiplier = getWeaponMultiplier(weaponDelta, difficulty);
      console.log(weaponMultiplier);

      // Combined Multiplier
      eplDeltaMulti = gearMultiplier * weaponMultiplier;

      const bossMulti = parseFloat(getMultiplier(category).replace('x', ''));
      console.log(bossMulti);



      if (selectedGun) {
        const body = parseFloat(selectedGun['crucible body/ explosion']);
        const head = parseFloat(selectedGun['crucible head/ impact']);

        const pveBodyBonus = parseFloat(selectedGun['PvE damage bonus body'].replace('x', '')) || 1;
        const pveHeadBonus = parseFloat(selectedGun['PvE damage bonus head'].replace('x', '')) || 1;

        const bodyDamage = body * pveBodyBonus * eplDeltaMulti * recomendedPLMulti * bossMulti;
        const headDamage = head * pveHeadBonus * eplDeltaMulti * recomendedPLMulti * bossMulti;
        const total = bodyDamage + headDamage;

        if (selectedGun['family'] === 'Rocket Launcher' || selectedGun['family'] === 'Heavy Grenade Launcher' || selectedGun['family'] === 'Special Grenade Launcher') {
          document.getElementById('resultDisplay').textContent = `Explosion Damage: ${bodyDamage.toFixed(0)} - Impact Damage: ${headDamage.toFixed(0)} - Total Damage: ${total.toFixed(0)}`;
        } else {
          document.getElementById('resultDisplay').textContent = `Body Damage: ${bodyDamage.toFixed(0)} - Head Damage: ${headDamage.toFixed(0)}`;
        }
      } else {
        document.getElementById('resultDisplay').textContent = 'No data available for the selected weapon style.';
      }
    })

}

function getGearMultiplier(delta, difficulty) {
  // Based on the provided gear delta multipliers
  const breakpoints = {
    normal: [
      { delta: 0, multiplier: 1.000 },
      { delta: -10, multiplier: 0.780 },
      { delta: -17, multiplier: 0.696 },
      { delta: -20, multiplier: 0.660 },
      { delta: -30, multiplier: 0.591 },
      { delta: -40, multiplier: 0.541 },
      { delta: -50, multiplier: 0.500 },
      { delta: -60, multiplier: 0.475 },
      { delta: -70, multiplier: 0.460 },
      { delta: -80, multiplier: 0.440 },
      { delta: -90, multiplier: 0.420 },
      { delta: -99, multiplier: 0.402 }
    ],
    rad: [
      { delta: 0, multiplier: 0.925 },
      { delta: -10, multiplier: 0.730 },
      { delta: -17, multiplier: 0.653 },
      { delta: -20, multiplier: 0.620 },
      { delta: -30, multiplier: 0.563 },
      { delta: -40, multiplier: 0.525 },
      { delta: -50, multiplier: 0.495 },
      { delta: -60, multiplier: 0.475 },
      { delta: -70, multiplier: 0.460 },
      { delta: -80, multiplier: 0.440 },
      { delta: -90, multiplier: 0.420 },
      { delta: -99, multiplier: 0.402 }
    ],
    master: [
      { delta: 0, multiplier: 0.850 },
      { delta: -10, multiplier: 0.680 },
      { delta: -17, multiplier: 0.610 },
      { delta: -20, multiplier: 0.580 },
      { delta: -30, multiplier: 0.535 },
      { delta: -40, multiplier: 0.510 },
      { delta: -50, multiplier: 0.490 },
      { delta: -60, multiplier: 0.475 },
      { delta: -70, multiplier: 0.460 },
      { delta: -80, multiplier: 0.440 },
      { delta: -90, multiplier: 0.420 },
      { delta: -99, multiplier: 0.402 }
    ]
  };

  let multiplier = 1.0;
  const diffBreakpoints = breakpoints[difficulty.toLowerCase()];

  for (let i = 0; i < diffBreakpoints.length; i++) {
    if (delta >= diffBreakpoints[i].delta) {
      multiplier = diffBreakpoints[i].multiplier;
      break;
    }
  }
  return multiplier;
}

function getWeaponMultiplier(delta) {
  const number = Math.exp(delta * 0.00672);
  if (difficulty == "normal" || difficulty == "rad") {
    if (number > 1.397) {
      return 1.397
    } else {
      return number
    }
  } else {
    if (number > 1.146) {
      return 1.146
    } else {
      return number
    }
  }
}

function getMultiplier(archetype) {
  const damageData = [
    { archetype: "Auto Rifle", multiplier: "1.15x" },
    { archetype: "Cerberus +1", multiplier: "0.86x" },
    { archetype: "Scout Rifle", multiplier: "1.30x" },
    { archetype: "Pulse Rifle", multiplier: "1.00x" },
    { archetype: "Revision Zero", multiplier: "1.00x" },
    { archetype: "Hand Cannon", multiplier: "1.30x" },
    { archetype: "Submachine Gun", multiplier: "1.53x" },
    { archetype: "Sidearm", multiplier: "1.55x" },
    { archetype: "Bow", multiplier: "1.50x" },
    { archetype: "Osteo Poison", multiplier: "1.00x" },
    { archetype: "Vex Mythoclast", multiplier: "2.50x" },
    { archetype: "Vex Mythoclast LFR", multiplier: "2.50x" },
    { archetype: "Shotgun", multiplier: "2.30x" },
    { archetype: "Special Grenade Launcher", multiplier: "2.50x" },
    { archetype: "Fusion Rifle", multiplier: "2.55x" },
    { archetype: "Bastion", multiplier: "1.40x" },
    { archetype: "Sniper Rifle", multiplier: "1.52x" },
    { archetype: "Trace Rifle", multiplier: "1.80x" },
    { archetype: "Exotic Trace Rifle", multiplier: "1.80x" },
    { archetype: "Glaive", multiplier: "3.00x" },
    { archetype: "Lorentz Driver", multiplier: "1.31x" },
    { archetype: "Arbalest", multiplier: "1.31x" },
    { archetype: "Sword", multiplier: "1.275x" },
    { archetype: "Heavy Grenade Launcher", multiplier: "3.00x" },
    { archetype: "Anarchy", multiplier: "2.10x" },
    { archetype: "Parasite", multiplier: "2.27x" },
    { archetype: "Rocket Launcher", multiplier: "4.70x" },
    { archetype: "Two-Tailed Fox", multiplier: "3.06x" },
    { archetype: "Wardcliff Coil", multiplier: "0.94x" },
    { archetype: "Eyes of Tomorrow", multiplier: "2.12x" },
    { archetype: "Wolfpack Rounds", multiplier: "1.00x" },
    { archetype: "Linear Fusion Rifle", multiplier: "1.543x" },
    { archetype: "Sleeper Queenbreaker", multiplier: "1.815x" },
    { archetype: "Machine Gun", multiplier: "2.16x" },
    { archetype: "Xenophage", multiplier: "1.80x" },
    { archetype: "Grand Overture", multiplier: "1.80x" },
    { archetype: "Leviathan's Breath Explosion", multiplier: "3.71x" },
  ];
  const entry = damageData.find(item => item.archetype === archetype);
  if (entry) {
    return entry.multiplier;
  } else {
    return 1;
  }
}