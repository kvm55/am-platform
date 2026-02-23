#!/usr/bin/env python3
"""Generate Propwell AMP Weekly Brief PDF — branded."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
from reportlab.platypus.flowables import Flowable
import os

# --- Brand Colors ---
TEAL = HexColor("#1A4141")
TEAL_LIGHT = HexColor("#245858")
TEAL_DARK = HexColor("#122E2E")
GREENERY = HexColor("#D3FF01")
GREENERY_DARK = HexColor("#B8E000")
BEIGE = HexColor("#CCC4B1")
CREAM = HexColor("#EAE8E3")
MINT = HexColor("#B4E0BA")
LIGHT_GRAY = HexColor("#F5F4F2")
MID_GRAY = HexColor("#888888")

OUTPUT_PATH = os.path.expanduser("~/Downloads/Propwell_AMP_Weekly_Brief_02.23.26.pdf")


class BrandBar(Flowable):
    """Full-width teal bar with greenery accent stripe."""
    def __init__(self, width, height=4):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        self.canv.setFillColor(TEAL)
        self.canv.rect(0, 1, self.width, self.height - 1, fill=1, stroke=0)
        self.canv.setFillColor(GREENERY)
        self.canv.rect(0, 0, self.width, 1.5, fill=1, stroke=0)


class AccentBox(Flowable):
    """Teal box with greenery left border for callout sections."""
    def __init__(self, width, text, style):
        super().__init__()
        self.width = width
        self.text = text
        self.style = style
        self._para = Paragraph(text, style)
        self._para.wrapOn(None, width - 28, 1000)
        self.height = self._para.height + 16

    def draw(self):
        self.canv.setFillColor(CREAM)
        self.canv.roundRect(0, 0, self.width, self.height, 4, fill=1, stroke=0)
        self.canv.setFillColor(GREENERY_DARK)
        self.canv.rect(0, 0, 4, self.height, fill=1, stroke=0)
        self._para.drawOn(self.canv, 16, 8)


def build_styles():
    ss = getSampleStyleSheet()
    styles = {}

    styles['title'] = ParagraphStyle(
        'Title', parent=ss['Title'],
        fontName='Helvetica-Bold', fontSize=28, leading=34,
        textColor=white, alignment=TA_LEFT, spaceAfter=2
    )
    styles['subtitle'] = ParagraphStyle(
        'Subtitle', parent=ss['Normal'],
        fontName='Helvetica', fontSize=13, leading=18,
        textColor=BEIGE, alignment=TA_LEFT, spaceAfter=0
    )
    styles['date'] = ParagraphStyle(
        'Date', parent=ss['Normal'],
        fontName='Helvetica', fontSize=11, leading=14,
        textColor=GREENERY, alignment=TA_LEFT
    )
    styles['h1'] = ParagraphStyle(
        'H1', parent=ss['Heading1'],
        fontName='Helvetica-Bold', fontSize=16, leading=22,
        textColor=TEAL, spaceBefore=18, spaceAfter=8
    )
    styles['h2'] = ParagraphStyle(
        'H2', parent=ss['Heading2'],
        fontName='Helvetica-Bold', fontSize=12, leading=16,
        textColor=TEAL_LIGHT, spaceBefore=12, spaceAfter=6
    )
    styles['body'] = ParagraphStyle(
        'Body', parent=ss['Normal'],
        fontName='Helvetica', fontSize=10, leading=14,
        textColor=TEAL_DARK, spaceAfter=6
    )
    styles['body_bold'] = ParagraphStyle(
        'BodyBold', parent=styles['body'],
        fontName='Helvetica-Bold'
    )
    styles['callout'] = ParagraphStyle(
        'Callout', parent=ss['Normal'],
        fontName='Helvetica', fontSize=10, leading=14,
        textColor=TEAL_DARK
    )
    styles['metric_label'] = ParagraphStyle(
        'MetricLabel', parent=ss['Normal'],
        fontName='Helvetica', fontSize=9, leading=12,
        textColor=MID_GRAY, alignment=TA_CENTER
    )
    styles['metric_value'] = ParagraphStyle(
        'MetricValue', parent=ss['Normal'],
        fontName='Helvetica-Bold', fontSize=20, leading=26,
        textColor=TEAL, alignment=TA_CENTER
    )
    styles['footer'] = ParagraphStyle(
        'Footer', parent=ss['Normal'],
        fontName='Helvetica', fontSize=8, leading=10,
        textColor=BEIGE, alignment=TA_CENTER
    )
    styles['table_header'] = ParagraphStyle(
        'TableHeader', parent=ss['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=12,
        textColor=white
    )
    styles['table_cell'] = ParagraphStyle(
        'TableCell', parent=ss['Normal'],
        fontName='Helvetica', fontSize=9, leading=12,
        textColor=TEAL_DARK
    )
    styles['table_cell_bold'] = ParagraphStyle(
        'TableCellBold', parent=styles['table_cell'],
        fontName='Helvetica-Bold'
    )
    styles['check'] = ParagraphStyle(
        'Check', parent=ss['Normal'],
        fontName='Helvetica', fontSize=10, leading=15,
        textColor=TEAL_DARK, leftIndent=12, spaceAfter=3
    )
    return styles


def make_table(headers, rows, col_widths, styles):
    """Build a branded table."""
    header_row = [Paragraph(h, styles['table_header']) for h in headers]
    data = [header_row]
    for row in rows:
        data.append([Paragraph(str(c), styles['table_cell']) for c in row])

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BEIGE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), CREAM))
        else:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), white))

    t.setStyle(TableStyle(style_cmds))
    return t


def make_bold_first_col_table(headers, rows, col_widths, styles):
    """Table with bold first column."""
    header_row = [Paragraph(h, styles['table_header']) for h in headers]
    data = [header_row]
    for row in rows:
        cells = [Paragraph(str(row[0]), styles['table_cell_bold'])]
        cells += [Paragraph(str(c), styles['table_cell']) for c in row[1:]]
        data.append(cells)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, BEIGE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), CREAM))
        else:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), white))

    t.setStyle(TableStyle(style_cmds))
    return t


def make_metric_card(label, value, width):
    """Single KPI metric card."""
    data = [[Paragraph(value, build_styles()['metric_value'])],
            [Paragraph(label, build_styles()['metric_label'])]]
    t = Table(data, colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), CREAM),
        ('BACKGROUND', (0, 1), (0, 1), LIGHT_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (0, 0), 12),
        ('BOTTOMPADDING', (0, 0), (0, 0), 4),
        ('TOPPADDING', (0, 1), (0, 1), 4),
        ('BOTTOMPADDING', (0, 1), (0, 1), 8),
        ('BOX', (0, 0), (-1, -1), 1, BEIGE),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    return t


def header_footer(canvas, doc):
    """Draw header bar and footer on every page."""
    canvas.saveState()
    w, h = letter

    # Footer
    canvas.setFillColor(TEAL)
    canvas.rect(0, 0, w, 28, fill=1, stroke=0)
    canvas.setFillColor(GREENERY)
    canvas.rect(0, 26, w, 2, fill=1, stroke=0)
    canvas.setFillColor(BEIGE)
    canvas.setFont('Helvetica', 8)
    canvas.drawCentredString(w / 2, 10, "Propwell AMP  |  propwell.co  |  Confidential")
    canvas.drawRightString(w - 40, 10, f"Page {doc.page}")

    canvas.restoreState()


def build_pdf():
    styles = build_styles()
    usable_width = letter[0] - 2 * 50  # 50pt margins

    doc = BaseDocTemplate(
        OUTPUT_PATH, pagesize=letter,
        leftMargin=50, rightMargin=50,
        topMargin=40, bottomMargin=50,
    )
    frame = Frame(50, 50, usable_width, letter[1] - 90, id='main')
    doc.addPageTemplates([PageTemplate(id='main', frames=frame, onPage=header_footer)])

    story = []

    # ========== PAGE 1: HEADER ==========
    # Teal header block
    header_data = [[
        Paragraph("PROPWELL AMP", styles['title']),
    ], [
        Paragraph("Weekly Platform Brief", styles['subtitle']),
    ], [
        Paragraph("Week of February 23, 2026", styles['date']),
    ]]
    header_table = Table(header_data, colWidths=[usable_width - 24])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), TEAL),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('TOPPADDING', (0, 0), (0, 0), 20),
        ('BOTTOMPADDING', (-1, -1), (-1, -1), 16),
        ('TOPPADDING', (0, 1), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (0, 1), 2),
        ('ROUNDEDCORNERS', [6, 6, 0, 0]),
    ]))
    story.append(header_table)
    story.append(BrandBar(usable_width - 24))
    story.append(Spacer(1, 16))

    # ========== KPI CARDS ==========
    card_w = (usable_width - 30) / 4
    cards_row = [[
        make_metric_card("HC + Rentometer", "$182/mo", card_w),
        make_metric_card("Data Cost / Report", "~$1.32", card_w),
        make_metric_card("Manual Cost Replaced", "$25-50", card_w),
        make_metric_card("Time Saved / Report", "25-45 min", card_w),
    ]]
    cards = Table(cards_row, colWidths=[card_w + 6] * 4)
    cards.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(cards)
    story.append(Spacer(1, 16))

    # ========== SECTION 1: PLATFORM STATUS ==========
    story.append(Paragraph("1. Platform Status", styles['h1']))
    story.append(Paragraph(
        "Propwell AMP is <b>deployed and demo-ready</b> at am-platform.vercel.app. "
        "The platform is running in mock data mode pending API subscription approvals. "
        "All three core tools are functional: Comp Analysis, Portfolio Summary, and Underwriting Models.",
        styles['body']
    ))
    story.append(Spacer(1, 4))

    status_items = [
        ["Web App (Next.js + Supabase)", "Live — deployed to Vercel production"],
        ["Comp Analysis Tool", "Complete — address input, comps, rent rec, scoring"],
        ["Portfolio Summary", "Complete — aggregated metrics, sort, CSV export"],
        ["Underwriting Models", "Complete — LTH / F&F / STR with IRR, Cap Rate, DSCR"],
        ["Authentication", "Live — Supabase OAuth, RLS on all tables"],
        ["Branding", "Complete — Propwell AMP identity, bolt icon, teal/greenery"],
    ]
    story.append(make_table(
        ["Component", "Status"],
        status_items,
        [usable_width * 0.4, usable_width * 0.6],
        styles
    ))
    story.append(Spacer(1, 12))

    # ========== SECTION 2: TEST ACCOUNT ==========
    story.append(Paragraph("2. Test Account for Jeff Gravelle", styles['h1']))
    story.append(AccentBox(
        usable_width,
        '<b>Login URL:</b> am-platform.vercel.app/signin<br/>'
        '<b>Email:</b> jgravelle@propwell.co<br/>'
        '<b>Password:</b> PropwellAMP2026!',
        styles['callout']
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Testing checklist:</b>", styles['body']))
    checklist = [
        "Sign in with credentials above",
        "Run a Comp Analysis (try: 732 W Concord St, Orlando, FL 32805)",
        "Review results: comps table, rent recommendation, vacancy scenarios, property score",
        "Check Portfolio Summary — sort columns, export CSV",
        "Run an Underwriting Model (LTH, F&F, or STR) on any property",
        "Open detail views from Dashboard recent items",
        "Test on mobile (responsive design)",
    ]
    checklist_items = []
    for item in checklist:
        checklist_items.append(Paragraph(f"\u2610  {item}", styles['check']))
    story.append(KeepTogether(checklist_items))
    story.append(Spacer(1, 6))

    # ========== SECTION 3: API ACCESS REQUEST ==========
    story.append(Paragraph("3. API Access Request — HouseCanary & Rentometer", styles['h1']))
    story.append(Paragraph(
        "To move from mock data to <b>live market data</b>, we need upgraded access to two "
        "data providers. These are non-overlapping — each delivers unique data the other cannot.",
        styles['body']
    ))
    story.append(Spacer(1, 8))

    # --- HouseCanary ---
    story.append(Paragraph("3a. HouseCanary — Market Analytics (No Alternative)", styles['h2']))
    story.append(Paragraph(
        "HouseCanary is the only provider with MSA and ZIP-level market health scoring. "
        "This powers the 12-metric market analysis and property scoring engine in AMP. "
        "No other API offers this combination of market-level data.",
        styles['body']
    ))
    story.append(make_bold_first_col_table(
        ["", "Detail"],
        [
            ["Plan Required", "Teams (Annual)"],
            ["Annual Cost", "$1,990/yr"],
            ["Monthly Effective", "$165.83/mo"],
            ["Included", "40 reports/mo + full API access"],
            ["Per-Call Cost", "$0.30 (Basic endpoints)"],
        ],
        [usable_width * 0.28, usable_width * 0.72],
        styles
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>What it provides per property run:</b>", styles['body']))
    story.append(make_table(
        ["Endpoint", "Cost/Call", "Data Delivered"],
        [
            ["Property Details", "$0.30", "Bed/bath/sqft verification, property type"],
            ["HPI Forecast (1yr)", "$0.30", "Home price index forecast"],
            ["RPI Forecast (1yr)", "$0.30", "Rental price index forecast"],
            ["Market Grade", "$0.30", "A-F grade for market health"],
            ["Risk of Decline", "$0.30", "Probability of price decline"],
            ["Sale-to-List / DOM / Supply", "$0.30", "Demand and absorption metrics"],
            ["Population Growth / Yield", "$0.30", "Growth and gross yield at ZIP"],
        ],
        [usable_width * 0.30, usable_width * 0.12, usable_width * 0.58],
        styles
    ))
    story.append(Paragraph(
        "HC cost per Tier 1 property: <b>$1.20</b> (4 calls \u00d7 $0.30 for MSA + ZIP stats)",
        styles['body']
    ))
    story.append(Spacer(1, 10))

    # --- Rentometer ---
    story.append(Paragraph("3b. Rentometer — Rent Benchmarking (No Alternative)", styles['h2']))
    story.append(Paragraph(
        "Rentometer provides statistical rent distribution data — percentiles, standard deviation, "
        "sample counts, and individual nearby comp listings. This is the rent intelligence layer "
        "that no other single provider replicates at this depth.",
        styles['body']
    ))
    story.append(make_bold_first_col_table(
        ["", "Detail"],
        [
            ["Plan Required", "Pro (Annual)"],
            ["Annual Cost", "$199/yr"],
            ["Monthly Effective", "$16.58/mo"],
            ["Included", "500 reports/yr (~42/mo), ~5,000 credits"],
            ["Per-Credit Cost", "$0.06\u20130.10"],
        ],
        [usable_width * 0.28, usable_width * 0.72],
        styles
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Rentometer cost per property: <b>$0.12\u20130.20</b> (2 credits: summary + nearby comps)",
        styles['body']
    ))
    story.append(Spacer(1, 10))

    # --- Combined Ask ---
    story.append(Paragraph("3c. Combined Ask — HC + Rentometer", styles['h2']))
    story.append(make_bold_first_col_table(
        ["", "Monthly", "Annual"],
        [
            ["HouseCanary Teams", "$165.83", "$1,990"],
            ["Rentometer Pro", "$16.58", "$199"],
            ["TOTAL (Fixed)", "$182.41/mo", "$2,189/yr"],
        ],
        [usable_width * 0.40, usable_width * 0.30, usable_width * 0.30],
        styles
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Variable cost per Tier 1 property run (HC + Rentometer only): <b>~$1.32\u20131.40</b>",
        styles['body']
    ))
    story.append(Spacer(1, 10))

    # ========== SECTION 4: RENTCAST EVALUATION ==========
    story.append(Paragraph("4. RentCast — Evaluate as Third Provider", styles['h1']))
    story.append(Paragraph(
        "RentCast is a third data provider currently in the pipeline design. Unlike HC and Rentometer, "
        "RentCast has <b>significant overlap</b> with what the other two already provide. "
        "The question is whether the overlap justifies the additional $74/mo.",
        styles['body']
    ))
    story.append(Spacer(1, 6))
    story.append(make_bold_first_col_table(
        ["", "Detail"],
        [
            ["Plan", "Foundation"],
            ["Monthly Cost", "$74/mo ($888/yr)"],
            ["Included", "1,000 calls/mo"],
            ["Per-Call Cost", "$0.074 effective"],
        ],
        [usable_width * 0.28, usable_width * 0.72],
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Where RentCast overlaps vs. adds value:</b>", styles['body']))
    story.append(make_table(
        ["Data Point", "RentCast", "Already Covered By", "Additive?"],
        [
            ["Property details (bed/bath/sqft)", "$0.074/call", "HC Property Details ($0.30)", "Cheaper, not unique"],
            ["Rental AVM (rent estimate)", "$0.074/call", "HC Rental AVM ($2.50 premium)", "Much cheaper for Tier 2"],
            ["Rental comps (3-5 listings)", "$0.074/call", "Rentometer nearby comps", "Overlaps"],
            ["Property value estimate", "$0.074/call", "HC Value Forecast ($2.50)", "Much cheaper for Tier 2"],
            ["Sale history / tax data", "$0.074/call", "HC Property Details", "Overlaps"],
        ],
        [usable_width * 0.24, usable_width * 0.14, usable_width * 0.32, usable_width * 0.30],
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Cost comparison — with vs. without RentCast:</b>", styles['body']))
    story.append(make_bold_first_col_table(
        ["", "HC + Rentometer Only", "HC + Rentometer + RentCast"],
        [
            ["Fixed monthly", "$182.41", "$256.41"],
            ["Tier 1 data cost / property", "~$1.32", "~$1.47"],
            ["Tier 2 data cost / property", "~$3.82 (HC premium AVM)", "~$1.55 (RentCast AVM)"],
            ["Best for", "Tier 1 focus, lower fixed cost", "Heavy Tier 2 usage, cheaper AVMs"],
        ],
        [usable_width * 0.30, usable_width * 0.35, usable_width * 0.35],
        styles
    ))
    story.append(Spacer(1, 6))
    story.append(AccentBox(
        usable_width,
        '<b>Recommendation:</b> Start with HC + Rentometer ($182/mo). Evaluate RentCast after '
        'live data is running. RentCast becomes cost-justified if Tier 2 volume exceeds ~30 reports/mo, '
        'where the cheaper AVM calls ($0.074 vs $2.50) offset the $74/mo subscription.',
        styles['callout']
    ))
    story.append(Spacer(1, 12))

    # ========== SECTION 5: PRODUCTION COST COMPARISON ==========
    story.append(Paragraph("5. Production Cost — Manual vs. Automated", styles['h1']))
    story.append(Paragraph(
        "The $75 (Tier 1) and $150 (Tier 2) figures represent <b>internal production cost</b> "
        "to produce each report manually — analyst time at $50/hr. AMP replaces this manual "
        "production with automated API calls + brief review.",
        styles['body']
    ))
    story.append(Spacer(1, 6))
    story.append(make_bold_first_col_table(
        ["", "Manual Production", "AMP Automated", "Savings / Report"],
        [
            ["Tier 1 — Comp Analysis", "$25 (30 min @ $50/hr)", "~$1.32 data + 5 min review", "~$19.50 / report"],
            ["Tier 2 — Investment Model", "$50 (60 min @ $50/hr)", "~$3.82 data + 15 min review", "~$33.68 / report"],
        ],
        [usable_width * 0.22, usable_width * 0.26, usable_width * 0.28, usable_width * 0.24],
        styles
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>At scale (200 leads/mo — 150 T1 + 50 T2):</b>", styles['body']))
    story.append(make_bold_first_col_table(
        ["Metric", "Manual", "Automated (AMP)"],
        [
            ["Tier 1 production time", "30 min / report", "5 min review"],
            ["Tier 2 production time", "60 min / report", "15 min review"],
            ["Monthly production cost", "$6,250 labor", "$380 data + $1,250 review = $1,630"],
            ["Monthly analyst hours", "125 hrs (0.78 FTE)", "25 hrs (0.16 FTE)"],
            ["Monthly savings", "\u2014", "$4,620"],
            ["Annual savings", "\u2014", "$55,440"],
            ["FTE capacity freed", "\u2014", "0.63 FTE"],
        ],
        [usable_width * 0.30, usable_width * 0.35, usable_width * 0.35],
        styles
    ))
    story.append(Spacer(1, 8))
    story.append(AccentBox(
        usable_width,
        '<b>Key takeaway:</b> At $182/mo in fixed API costs, the platform pays for itself after '
        '<b>10 Tier 1 reports</b> per month in labor savings alone. Every report beyond that is '
        'net capacity freed.',
        styles['callout']
    ))
    story.append(Spacer(1, 14))

    # ========== SECTION 6: ACTION ITEMS ==========
    story.append(Paragraph("6. Action Items", styles['h1']))
    story.append(Paragraph("<b>For Jeff (Approvals):</b>", styles['body']))
    jeff_items = [
        "Test the platform using credentials on page 1",
        "Approve HouseCanary Teams upgrade \u2014 $1,990/yr ($165.83/mo)",
        "Approve Rentometer Pro subscription \u2014 $199/yr ($16.58/mo)",
        "Decide on RentCast \u2014 add now ($74/mo) or evaluate after go-live",
        "Total ask without RentCast: $182.41/mo fixed + ~$1.32 per property",
    ]
    for item in jeff_items:
        story.append(Paragraph(f"\u2610  {item}", styles['check']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>For Kris (Post-Approval):</b>", styles['body']))
    kris_items = [
        "Activate HouseCanary Teams, add API key to platform",
        "Set up Rentometer Pro, add API key",
        "Switch platform from mock \u2192 live data",
        "Calibrate scoring model against 10 real Propwell reports",
        "Deploy live-data version to production",
        "If RentCast approved: complete account creation and integrate",
    ]
    for item in kris_items:
        story.append(Paragraph(f"\u2610  {item}", styles['check']))
    story.append(Spacer(1, 12))

    # ========== SECTION 7: BUDGET FILE NOTES ==========
    story.append(Paragraph("7. Budget File Review Notes", styles['h1']))
    story.append(Paragraph(
        "The <b>AM_Pipeline_Financial_Model.xlsx</b> (6 tabs) is well-built \u2014 all formulas verified, "
        "three sensitivity scenarios modeled, breakeven in Month 1. However, the model bundles all "
        "three providers together. Should be updated to reflect HC + Rentometer as baseline.",
        styles['body']
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Issues flagged in propwell_AM budget model_021326.xlsx:</b>", styles['body_bold']))
    story.append(Paragraph(
        "\u2022  Row 73 shows \"HC Basic Access\" at $20/mo flat \u2014 needs update to <b>HouseCanary Teams at $165.83/mo</b><br/>"
        "\u2022  Rows 74-87 (Rentometer + RentCast data costs) are empty \u2014 need to be populated<br/>"
        "\u2022  Financial model should separate HC + Rentometer baseline from RentCast-optional scenario<br/>"
        "\u2022  Per-property cost formulas need to reflect correct provider mix",
        styles['body']
    ))

    # Build
    doc.build(story)
    print(f"PDF saved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_pdf()
