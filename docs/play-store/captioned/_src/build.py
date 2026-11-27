# Builds captioned Play Store screenshots (1080x1920) from the raw app captures.
import subprocess, pathlib
HERE = pathlib.Path(__file__).resolve().parent
SHOTS = HERE.parents[1] / "screenshots"
FONT = HERE.parents[2] / "fonts" / "NotoNastaliqUrdu.ttf"
OUT = HERE.parent
ITEMS = [
 ("03_home", "Check your eyesight at home", "گھر بیٹھے نظر چیک کریں"),
 ("05_symptom_selector", "Tell us what you notice — we pick the tests", "بتائیں کیا محسوس ہو رہا ہے"),
 ("08_test_color", "7 standard eye tests", "آنکھوں کے 7 معیاری ٹیسٹ"),
 ("09_final_summary", "Clear result: when to see a doctor", "واضح نتیجہ: ڈاکٹر کب دکھانا ہے"),
 ("13_home_urdu", "Full Urdu, with spoken guidance", "مکمل اردو، آواز کے ساتھ"),
 ("10_history", "Your results stay on your phone", "آپ کے نتائج صرف آپ کے فون پر"),
]
TPL = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Nast;src:url('{font}')}}
html,body{{margin:0;width:1080px;height:1920px;overflow:hidden}}
body{{background:linear-gradient(170deg,#1A6FD4 0%,#0F4C99 100%);font-family:'Inter','Segoe UI',Roboto,Arial,sans-serif;color:#fff;text-align:center}}
.cap{{padding:110px 70px 0}}
.en{{font-size:76px;font-weight:800;line-height:1.12;letter-spacing:-1px}}
.ur{{font-family:Nast;font-size:50px;line-height:2;margin-top:26px;opacity:.95;direction:rtl}}
.phone{{position:absolute;left:50%;transform:translateX(-50%);top:{top}px;width:640px;border-radius:56px;background:#0b1830;padding:18px;box-shadow:0 40px 80px rgba(0,0,0,.35)}}
.phone img{{display:block;width:100%;border-radius:40px}}
</style></head><body><div class="cap"><div class="en">{en}</div><div class="ur">{ur}</div></div>
<div class="phone"><img src="{img}"></div></body></html>"""
for i,(name,en,ur) in enumerate(ITEMS,1):
    top = 560 if len(en) > 28 else 480
    html = HERE / f"{i:02d}_{name}.html"
    html.write_text(TPL.format(font=FONT.as_uri(), en=en, ur=ur, img=(SHOTS/f"{name}.png").as_uri(), top=top), encoding="utf-8")
    png = OUT / f"{i:02d}_{name}.png"
    subprocess.run(["google-chrome","--headless=new","--disable-gpu","--hide-scrollbars","--force-device-scale-factor=1",
        "--allow-file-access-from-files","--window-size=1080,1920",f"--screenshot={png}",html.as_uri()],check=True,capture_output=True)
    print(png.name)
