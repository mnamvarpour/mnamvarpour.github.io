from pathlib import Path
import re
from tqdm import tqdm
from markdown import markdown
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

ROOT = Path(__file__).parent
SOURCE = ROOT / "cv.md"
OUTPUT = ROOT / "CV.pdf"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CVName", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=23, leading=27, textColor=colors.HexColor("#202124"), alignment=TA_LEFT, spaceAfter=4))
styles.add(ParagraphStyle(name="CVSubtitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.5, leading=14, textColor=colors.HexColor("#4a4a4a"), spaceAfter=5))
styles.add(ParagraphStyle(name="CVContact", parent=styles["Normal"], fontName="Helvetica", fontSize=8.8, leading=12, textColor=colors.HexColor("#1769aa"), spaceAfter=4))
styles.add(ParagraphStyle(name="CVLocation", parent=styles["Normal"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=colors.HexColor("#4a4a4a"), spaceAfter=8))
styles.add(ParagraphStyle(name="CVSection", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#202124"), spaceBefore=10, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name="CVSubsection", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=10.5, leading=12, textColor=colors.HexColor("#1f2933"), spaceBefore=6, spaceAfter=2, keepWithNext=True))
styles.add(ParagraphStyle(name="CVBody", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.8, leading=11.5, textColor=colors.HexColor("#263238"), spaceAfter=4))
styles.add(ParagraphStyle(name="CVBullet", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.8, leading=11.5, leftIndent=12, firstLineIndent=-8, bulletIndent=0, textColor=colors.HexColor("#263238"), spaceAfter=2))

def inline(text):
    emoji_images = {
        "✉️": "email",
        "📞": "phone",
        "🔗": "link",
        "🎓": "scholar",
        "💻": "github",
    }
    for emoji, name in emoji_images.items():
        image = ROOT / "emoji" / f"{name}.png"
        text = text.replace(emoji, f'<img src="{image}" width="13" height="16"/>')
    html = markdown(text, extensions=["nl2br"]).replace("<p>", "").replace("</p>", "").strip()
    return re.sub(r'(<a href="[^"]+">)(.*?)(</a>)', r'\1<font color="#1769aa">\2</font>\3', html)

def build_story(lines):
    story = []
    pbar = tqdm(lines, desc="Building CV", unit="line")
    content_seen = 0
    for raw in pbar:
        line = raw.strip()
        if not line:
            story.append(Spacer(1, 3))
            continue
        if line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), styles["CVName"]))
        elif line.startswith("**") and line.endswith("**"):
            story.append(Paragraph(inline(line), styles["CVSubtitle"]))
        elif line.startswith("## "):
            if content_seen:
                story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#d9d9d9"), spaceBefore=4, spaceAfter=6))
            story.append(Paragraph(inline(line[3:]), styles["CVSection"]))
        elif line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), styles["CVSubsection"]))
        elif line.startswith("- "):
            story.append(Paragraph(inline(line[2:]), styles["CVBullet"], bulletText="•"))
        else:
            style = styles["CVBody"]
            if "mailto:" in line or "Google Scholar" in line:
                style = styles["CVContact"]
            if line == "Philadelphia, PA":
                style = styles["CVLocation"]
            story.append(Paragraph(inline(line), style))
        content_seen += 1
    return story

def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#7b8794"))
    canvas.drawRightString(letter[0] - 0.65 * inch, 0.42 * inch, f"Matt Namvarpour  |  {doc.page}")
    canvas.restoreState()

def main():
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    document = SimpleDocTemplate(str(OUTPUT), pagesize=letter, rightMargin=0.65 * inch, leftMargin=0.65 * inch, topMargin=0.55 * inch, bottomMargin=0.65 * inch, title="Matt Namvarpour - CV", author="Matt Namvarpour")
    document.build(build_story(lines), onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"Created {OUTPUT}")

if __name__ == "__main__":
    main()
