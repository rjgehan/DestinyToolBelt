import json
import tkinter as tk
from tkinter import simpledialog, messagebox
import difflib
import os

def weaponsDatabase():
    with open('weaponDatabase.json', 'r') as file:
        data = json.load(file)
    return data
'''
this will serve as the main file where the equation is calculated
main equation is as follows
 
totalDamageScalar = pvpDamage * pveBonus * recomendedPLMulti * gearEPLmulti * weaponEPLmulti * combatantTypeMulti * activityMulti
totalSingleShot = totalDamageScalar * perks * globalBuffs/debuffs * kineticMulti

pvpDamage = ammount of damage it does in pvp
    code done
    data 90%
    might have some outliers where the two databases dont match up
    fixed for exotic trace rifles
    fixed for grenade launchers, special and heavy
'''
def archetype():
    with open('archetypes.json', 'r') as file:
        data = json.load(file)
    return data

# input - gun name
# return - {'Damage': '330.000', 'Crit': '-'}
def findArchetypes(gun_name):
    archetypes = archetype()
    weaponsDatabases = weaponsDatabase()
    # Check if gun_name exists in weaponsDatabases
    if gun_name in weaponsDatabases:
        try:
            # Attempt to access "gunType" and "archetype"
            gunType = weaponsDatabases[gun_name].get("gunType")
            if gunType == "Exotic Trace Rifle":
                gunType = "Trace Rifle"
            if gunType == "Special Grenade Launcher" or gunType == "Heavy Grenade Launcher":
                gunType = "Grenade Launcher"
            frame = weaponsDatabases[gun_name].get("archetype")

            # Check if gunType and frame are not None
            if gunType is None or frame is None:
                return "Missing 'gunType' or 'archetype' information for: " + gun_name

            # Additional check if the gunType exists in archetypes and has the frame
            if gunType in archetypes and frame in archetypes[gunType]:
                gunType = archetypes[gunType][frame]
                return gunType
            else:
                return "No matching 'gunType' or 'frame' in archetypes for: " + gun_name
        except KeyError as e:
            # Handle missing keys or other KeyError issues
            return f"Error accessing data for {gun_name}: {str(e)}"
    else:
        return "No archetype found for: " + gun_name
'''
    
pveBonus = bonus applied to guns in pve, different for every weapon
    no code
    data done?
'''
def pveBonus():
    with open('pveMulti.json', 'r') as file:
        data = json.load(file)
    return data

def findPVEBonus(gun_name):
    pveBonuses = pveBonus()
    weaponsDatabases = weaponsDatabase()
    if gun_name in weaponsDatabases.keys():
        gunType = weaponsDatabases[gun_name]["gunType"]
        arch = weaponsDatabases[gun_name]["archetype"]
        try:
            return pveBonuses[gunType][arch]
        except:
            return {'category': 'Found but no data', 'multiplier': 1}
    else:
        return "nothing found"

'''   
recomendedPLMulti = Recommended PL Multiplier = [Recommended PL]/40 + 0.75
    look at the reddit if you want to know why, i have no idea
    no code
    no data
'''
def recomendedPLMulti(activity):
    return 1
'''
    
gearEPLmulti = very confusing
    ACCORDING TO CHATGPT
    Normal Difficulty:
    y = 1.435e-6*x^3 + 2.919e-4*x^2 + 0.0208*x + 0.981
    RAD Difficulty:
    y = 1.399e-6*x^3 + 2.746e-4*x^2 + 0.0187*x + 0.908
    Master Difficulty:
    y = 1.362e-6*x^3 + 2.568e-4*x^2 + 0.0166*x + 0.834
    might need to just make this a json instead of the math, the data is on reddit
    Enemies are immune after -99, capped at +0
    no code
    no data


weaponEPLmulti = e^(weapon_ePL_delta * 0.00672)
    this might not be 100% accurate ^^
    no code
    no data
    

combatantTypeMulti = make a json for this
    code done
    data done
    if no data for exotic, use legendary
    trace rifles are different
    wolfpacks are included
    exotic primaries need the 1.4 on top of the base
    
'''
def combatantTypeMulti():
    with open('combatantModifiers.json') as file:
        data = json.load(file)
    return data

# input - string name of gun
# return - mod dict
def findCombatantMods(gun_name):
    combatantTypeMultis = combatantTypeMulti()
    weaponsDatabases = weaponsDatabase()
    if gun_name in weaponsDatabases.keys():
        gunType = weaponsDatabases[gun_name]["gunType"]
        if gun_name in combatantTypeMultis[gunType]["combatantModifiers"].keys():
            return combatantTypeMultis[gunType]["combatantModifiers"][gun_name]
        else:
            return combatantTypeMultis[gunType]["combatantModifiers"]["legendary"]
    else:
        return ("No gun found with name: " + gun_name)  
'''

activityMulti = = make a json for this
    all activities are recomended LL of when they were released, not updated every season like you would think
    no code
    no data
    
perks = complicated, a problem for another time
    hi future ryan :) have fun
    no code
    no data

globalBuffs/debuffs = hehe
    lolololololololol
    no code
    no data
    
kinetcMulti = kinetic guns do more damage
    data in weapon database
    code
'''
def findKineticMulti(name):
    primaries = ["Auto Rifle", "Scout Rifle", "Pulse Rifle", "Hand Cannon", "Submachine Gun", "Sidearm", "Combat Bow"]
    specials = ["Shotgun", "Special Grenade Launcher", "Fusion Rifle", "Sniper Rifle", "Trace Rifle", "Glaive", "Linear Fusion Rifle"]
    database = weaponsDatabase()
    if name in database.keys():
        gun = database[name]
        energy = gun["energy"]
        gunType = gun["gunType"]
        if energy == "Kinetic" and gunType in primaries:
            return 1.1
        else:
            return 1
'''    
    
CRIT?????
how does div work???
----------------------------------------------------------------------------------------------------------------------------------------------------
'''



def finalCalc(combatantMods, pvpDam, pveBonus, enemy, kineticMultis, crit):
    recomendedPLMulti = 14.75
    gearEPLmulti = 0.925
    weaponEPLmulti = 1.146
    activityMulti = 1.0
    critical = 1.0
    if crit:
        if pvpDam["Crit"] != "-":
            critical = pvpDam["Crit"]
    try:
        totalDamageScalar = float(pvpDam["Damage"]) * float(pveBonus["multiplier"]) * float(recomendedPLMulti) * float(gearEPLmulti) * float(weaponEPLmulti) * float(combatantMods[enemy]) * float(activityMulti) * kineticMultis * float(critical)
        print("" , float(pvpDam["Damage"]) , " * " , float(pveBonus["multiplier"]) , " * " , float(recomendedPLMulti) , " * " , float(gearEPLmulti) , " * " , float(weaponEPLmulti) , " * " , float(combatantMods[enemy]) , " * " , float(activityMulti), " * ", kineticMultis, " * ", str(critical))
        return totalDamageScalar
    except: 
        print("something went wrong")
        return 1

def clear_screen():
    if os.name == 'nt':
        os.system('cls')
    else:
        os.system('clear')

def find_closest_match(user_input, choices):
    matches = difflib.get_close_matches(user_input, choices, n=1, cutoff=0.6)  # Adjust cutoff for accuracy
    return matches[0] if matches else None


# Calculating damage for Gallu RR3...
#  130.993  *  1.0  *  14.75  *  0.925  *  1.146  *  1.52  *  1.0  *  1
# 3113.2216867529996

# Calculating damage for Horror Story...
#  19.997  *  1.0  *  14.75  *  0.925  *  1.146  *  1.15  *  1.0  *  1.1
# 395.5248211261876

# pscale_pw_ih7gk0X8KpXiM73otcupFR8pNlBDCQ4kye07hPlNrlQ
# ydh2vi71smas3hdi1n8b