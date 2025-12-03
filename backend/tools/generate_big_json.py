# backend/tools/generate_big_json.py
import json
import os
import random
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / "data" / "brands.json"

# Config — adjust for dataset size
BRAND_COUNT = 80               # number of brands
APPLIANCES_PER_BRAND = 8      # number of appliance types per brand
ISSUES_PER_APPLIANCE = 25     # number of unique issues per appliance
# Estimated total issues = BRAND_COUNT * APPLIANCES_PER_BRAND * ISSUES_PER_APPLIANCE

BRAND_POOL = [
    "LG", "Samsung", "Bosch", "Whirlpool", "IFB", "Panasonic", "Sony", "Hitachi",
    "Kent", "Voltas", "Haier", "BlueStar", "Godrej", "Midea", "Sharp", "Siemens",
    "Videocon", "Bajaj", "Morphy Richards", "Philips", "Havells", "V-Guard",
    "Carrier", "Electrolux", "GE", "Kenmore", "Ariston", "Gree", "Sanyo", "Crompton"
]
APPLIANCE_POOL = [
    "Washing Machine", "Front-load Washer", "Top-load Washer", "Refrigerator",
    "Microwave Oven", "Air Conditioner", "Window AC", "Split AC",
    "TV", "Smart TV", "Geyser", "Water Heater", "Induction Cooktop",
    "Chimney", "Dishwasher", "Vacuum Cleaner", "Mixer Grinder", "Juicer",
    "Water Purifier", "Coffee Maker"
]

ISSUE_TEMPLATES = [
    ("Not powering on", [
        "Check the power cord, ensure the socket is working, and test with a different outlet.",
        "Check internal fuses and the mains input on the PCB; replace defective fuses."
    ]),
    ("Doesn't start / won't spin", [
        "Check door/lid lock and interlock switches; ensure the drum is empty and balanced.",
        "Inspect motor capacitor/connections; test motor continuity and replace if faulty."
    ]),
    ("Not cooling / poor cooling", [
        "Check refrigerant levels, condenser coil for dust, and clean filters.",
        "Verify compressor operation; inspect start relay and overload protector."
    ]),
    ("Leaking water", [
        "Inspect inlet/outlet hoses and clamps, and check the drain pump for blockages.",
        "Check door gasket seals for damage and reseal or replace if necessary."
    ]),
    ("Strange noise / vibration", [
        "Level the appliance and tighten mounting bolts; remove foreign objects.",
        "Inspect bearings, belts, and suspension springs for wear and replace as needed."
    ]),
    ("Display or control panel error", [
        "Power cycle the unit, check for water ingress, and reseat ribbon cables.",
        "If error persists, check error code in manual and replace faulty control board."
    ]),
    ("Heating not working", [
        "Check heating element continuity and thermostat; replace faulty element.",
        "Inspect thermal fuse and associated wiring; ensure proper supply to the element."
    ]),
    ("Door not closing / latch broken", [
        "Clean latch and hinges, check for alignment, replace latch if broken.",
        "Realign door hinge screws and check strike plate for damage."
    ]),
]

SAFETY_NOTES = [
    "Always disconnect power supply before performing repairs.",
    "If the appliance is under warranty, contact authorized service to avoid voiding warranty.",
    "Use insulated tools and follow safety precautions when working with electrical parts."
]

def make_title(base, variant_idx):
    extras = ["(intermittent)", "(after long use)", "(during start)", "(sudden)"]
    if variant_idx % 7 == 0:
        return f"{base} {random.choice(extras)}"
    return base

def make_solution(brand, appliance, title, detail):
    steps = [
        detail,
        "If problem persists, isolate the component and test using a multimeter.",
        "If you are not comfortable with electrical repairs, call a certified technician.",
    ]
    est_time = random.choice(["10-30 mins", "30-60 mins", "1-2 hours"])
    difficulty = random.choice(["Easy", "Moderate", "Hard"])
    parts = random.sample(["gasket", "motor", "pump", "heater element", "control board", "relay", "capacitator", "valve"], k=2)
    text = textwrap.dedent(f"""
    Issue: {title}
    Appliance: {appliance}
    Brand: {brand}

    Recommended steps:
    1) {steps[0]}
    2) {steps[1]}
    3) {steps[2]}

    Estimated time: {est_time}
    Difficulty: {difficulty}
    Possible parts: {', '.join(parts)}

    Safety: {random.choice(SAFETY_NOTES)}
    """).strip()
    return text

def generate():
    random.seed(42)
    brands = []
    # expand brand list if needed
    while len(brands) < BRAND_COUNT:
        for b in BRAND_POOL:
            if len(brands) >= BRAND_COUNT: break
            suffix = ""
            # occasionally add numeric suffix for uniqueness
            if random.random() < 0.15:
                suffix = f" {random.randint(1,99)}"
            brands.append(b + suffix)
    data = {}
    for brand in brands:
        data[brand] = {}
        appliances = random.sample(APPLIANCE_POOL, k=min(APPLIANCES_PER_BRAND, len(APPLIANCE_POOL)))
        for app in appliances:
            issues = {}
            selected_templates = random.choices(ISSUE_TEMPLATES, k=ISSUES_PER_APPLIANCE)
            for idx, tpl in enumerate(selected_templates):
                title_base, variants = tpl
                title = make_title(title_base, idx)
                detail = random.choice(variants)
                # add small variety to detail
                if random.random() < 0.3:
                    detail += " Also inspect wiring harness and connectors."
                sol = make_solution(brand, app, title, detail)
                # ensure unique key by appending index if duplicate
                key = title
                counter = 1
                while key in issues:
                    counter += 1
                    key = f"{title} ({counter})"
                issues[key] = sol
            data[brand][app] = {
                "brand_page": f"https://{brand.replace(' ','').lower()}.example.com/{app.replace(' ','-').lower()}",
                "common_issues": issues
            }

    os.makedirs(OUT_PATH.parent, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    total_issues = sum(len(data[b][a]["common_issues"]) for b in data for a in data[b])
    print(f"Generated {len(data)} brands, ~{total_issues} issues -> {OUT_PATH}")

if __name__ == "__main__":
    generate()
