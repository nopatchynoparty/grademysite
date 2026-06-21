import React from "react";
import path from "path";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Svg,
  Path,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

const LOGO_PATH = path.join(process.cwd(), "public/logo.svg");
import {
  type FullAnalysis,
  type RuleResult,
  GRADE_COLOURS,
  getRuleName,
} from "@/lib/rules";

Font.register({
  family: "Plus Jakarta Sans",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU7NSg.ttf",
      fontWeight: 400,
      fontStyle: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIZaomQNQcsA88c7O9yZ4KMCoOg4KozySKCdSNG9OcqYQ0lCR_Q.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_m07NSg.ttf",
      fontWeight: 500,
      fontStyle: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIZaomQNQcsA88c7O9yZ4KMCoOg4KozySKCdSNG9OcqYQ0XCR_Q.ttf",
      fontWeight: 500,
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_TknNSg.ttf",
      fontWeight: 700,
      fontStyle: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KUnNSg.ttf",
      fontWeight: 800,
      fontStyle: "normal",
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const HEADING_ORDER = ["hero", "problem", "solution", "social_proof", "cta"];

const C = {
  ink: "#1B2534",
  blue: "#3B6CF4",
  blueDark: "#2350D4",
  blueLight: "#EEF2FF",
  red: "#EF4444",
  redLight: "#FEF2F2",
  green: "#22C55E",
  surface: "#F4F6F8",
  surfaceAlt: "#F8FAFC",
  border: "#E5E7EB",
  muted: "#6B7280",
  white: "#ffffff",
};

// 1pt ≈ 1.333px; 2.5cm ≈ 70.8pt
const MARGIN = 56;

const s = StyleSheet.create({
  page: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 10,
    color: C.ink,
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
    backgroundColor: C.white,
  },

  // ── Header / footer ─────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 8,
    marginBottom: 28,
  },
  pageHeaderLogo: { fontSize: 10, fontWeight: 700, color: C.ink },
  pageHeaderLogoAccent: { color: C.blue },
  pageHeaderUrl: { fontSize: 9, color: C.muted },
  pageFooter: {
    position: "absolute",
    bottom: 28,
    left: MARGIN,
    right: MARGIN,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  pageFooterText: { fontSize: 8, color: C.muted },

  // ── Cover ───────────────────────────────────────────────────────────────────
  coverLogo: { fontSize: 13, fontWeight: 700, color: C.ink },
  coverLogoAccent: { color: C.blue },
  coverBusiness: { fontSize: 28, fontWeight: 800, color: C.ink, marginBottom: 6 },
  coverUrl: { fontSize: 12, color: C.muted, marginBottom: 4 },
  coverDate: { fontSize: 10, color: C.muted, marginBottom: 40 },
  coverGradeWrap: { alignItems: "center", marginBottom: 20 },
  coverGradeBox: {
    width: 110,
    height: 110,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  coverGradeLetter: { fontSize: 64, fontWeight: 800, color: C.white },
  coverScore: { fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 4 },
  coverScoreSub: { fontSize: 11, color: C.muted },
  coverHeadline: {
    fontSize: 15,
    fontWeight: 500,
    color: C.ink,
    lineHeight: 1.5,
    marginTop: 24,
    marginBottom: 0,
  },
  coverFooter: {
    position: "absolute",
    bottom: 28,
    left: MARGIN,
    right: MARGIN,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  coverFooterText: { fontSize: 9, color: C.muted, textAlign: "center" },

  // ── Section headings ─────────────────────────────────────────────────────────
  pageTitle: { fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 6 },
  pageSub: { fontSize: 10, color: C.muted, lineHeight: 1.5, marginBottom: 24 },

  // ── Win cards ────────────────────────────────────────────────────────────────
  winCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  winLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: C.blue,
    marginBottom: 5,
  },
  winName: { fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 5 },
  winImpact: { fontSize: 10, color: C.ink, lineHeight: 1.5, marginBottom: 6 },
  winFix: { fontSize: 10, color: C.muted, lineHeight: 1.5 },
  winFixBold: { fontWeight: 700, color: C.blue },

  // ── Scorecard ────────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 16,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  ruleIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  ruleContent: { flex: 1 },
  ruleName: { fontSize: 10, fontWeight: 700, color: C.ink, marginBottom: 2 },
  ruleFinding: { fontSize: 9, color: C.muted, lineHeight: 1.4 },
  ruleRationale: { fontSize: 9, color: "#9CA3AF", lineHeight: 1.4, fontStyle: "italic", marginTop: 2 },

  // ── Copy page ────────────────────────────────────────────────────────────────
  copySection: { marginBottom: 18 },
  copyLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 5,
  },
  copyHeadline: { fontSize: 16, fontWeight: 800, color: C.ink, lineHeight: 1.4 },
  copySub: { fontSize: 11, color: C.ink, lineHeight: 1.5 },
  copyBody: { fontSize: 10, color: C.ink, lineHeight: 1.5 },
  copyBullet: { flexDirection: "row", gap: 6, marginBottom: 4 },
  copyBulletDot: { fontSize: 10, color: C.blue, fontWeight: 700, flexShrink: 0 },
  copyBulletText: { fontSize: 10, color: C.ink, lineHeight: 1.5, flex: 1 },
  copyItalic: { fontSize: 10, color: C.muted, lineHeight: 1.5, fontStyle: "italic" },
  ctaBox: {
    backgroundColor: C.blue,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  ctaText: { fontSize: 11, fontWeight: 700, color: C.white },
  headingsRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  headingsKey: { fontSize: 9, fontWeight: 600, color: C.muted, width: 80, textTransform: "capitalize" },
  headingsVal: { fontSize: 10, color: C.ink, flex: 1 },

  // ── Testimonial / next steps ──────────────────────────────────────────────────
  promptCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  promptNum: { fontSize: 8, color: C.muted, marginBottom: 4 },
  promptText: { fontSize: 10, color: C.ink, lineHeight: 1.5, fontStyle: "italic" },
  stepRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.blueLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: { fontSize: 9, fontWeight: 700, color: C.blue },
  stepText: { fontSize: 10, color: C.ink, lineHeight: 1.5, flex: 1, paddingTop: 3 },
  closingNote: {
    backgroundColor: C.blueLight,
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
  },
  closingNoteText: { fontSize: 10, color: C.blueDark, lineHeight: 1.5 },

  // ── Back cover ────────────────────────────────────────────────────────────────
  backCoverWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backLogo: { fontSize: 18, fontWeight: 800, color: C.ink },
  backLogoAccent: { color: C.blue },
  backUrl: { fontSize: 11, color: C.muted, marginBottom: 4 },
  backTagline: { fontSize: 10, color: C.muted, marginBottom: 24 },
  backCopyright: { fontSize: 8, color: "#D1D5DB" },
});

// ── Shared sub-components ─────────────────────────────────────────────────────

function LogoBrand({
  iconSize,
  textStyle,
  accentStyle,
  wrapperStyle,
}: {
  iconSize: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textStyle: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accentStyle: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapperStyle?: any;
}) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-end", gap: 5 }, wrapperStyle]}>
      <Image src={LOGO_PATH} style={{ width: iconSize, height: iconSize }} />
      <Text style={textStyle}>
        Grade<Text style={accentStyle}>My</Text>Site
      </Text>
    </View>
  );
}

function PageHeader({ url }: { url: string }) {
  return (
    <View style={s.pageHeader} fixed>
      <LogoBrand iconSize={11} textStyle={s.pageHeaderLogo} accentStyle={s.pageHeaderLogoAccent} />
      <Text style={s.pageHeaderUrl}>{url}</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.pageFooterText}>Grade My Site · grademy.site</Text>
      <Text
        style={s.pageFooterText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function RuleIcon({ pass, unable }: { pass?: boolean; unable?: boolean }) {
  const bg = unable ? C.surface : pass ? "#DCFCE7" : "#FEE2E2";
  const stroke = unable ? C.muted : pass ? C.green : C.red;
  return (
    <View style={[s.ruleIcon, { backgroundColor: bg }]}>
      {pass && !unable && (
        <Svg width={8} height={8} viewBox="0 0 10 10">
          <Path d="M 1 5.5 L 3.8 8.5 L 9 2" stroke={stroke} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
      {!pass && !unable && (
        <Svg width={8} height={8} viewBox="0 0 10 10">
          <Path d="M 2 2 L 8 8" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
          <Path d="M 8 2 L 2 8" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      )}
      {unable && (
        <Svg width={8} height={8} viewBox="0 0 10 10">
          <Path d="M 2 5 L 8 5" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      )}
    </View>
  );
}

function RuleRow({ r, pass, unable }: { r: RuleResult; pass?: boolean; unable?: boolean }) {
  const name = getRuleName(r);
  return (
    <View style={s.ruleRow} wrap={false}>
      <RuleIcon pass={pass} unable={unable} />
      <View style={s.ruleContent}>
        <Text style={unable ? [s.ruleName, { color: C.muted }] : s.ruleName}>{name}</Text>
        <Text style={s.ruleFinding}>{r.finding}</Text>
        {r.rationale ? <Text style={s.ruleRationale}>{r.rationale}</Text> : null}
      </View>
    </View>
  );
}

// ── Pages ─────────────────────────────────────────────────────────────────────

function CoverPage({
  url,
  analysis,
  tier,
  reportDate,
  screenshotUrl,
}: {
  url: string;
  analysis: FullAnalysis;
  tier: string;
  reportDate: string;
  screenshotUrl?: string | null;
}) {
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  let businessName = displayUrl;
  try {
    businessName = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* leave as displayUrl */
  }
  const gradeColour = GRADE_COLOURS[analysis.grade] ?? C.muted;

  return (
    <Page size="A4" style={s.page}>
      <LogoBrand iconSize={16} textStyle={s.coverLogo} accentStyle={s.coverLogoAccent} wrapperStyle={{ marginBottom: 48 }} />
      <Text style={s.coverBusiness}>{businessName}</Text>
      <Text style={s.coverUrl}>{displayUrl}</Text>
      <Text style={s.coverDate}>{reportDate}</Text>

      <View style={s.coverGradeWrap}>
        <View style={[s.coverGradeBox, { backgroundColor: gradeColour }]}>
          <Text style={s.coverGradeLetter}>{analysis.grade}</Text>
        </View>
        <Text style={s.coverScore}>
          {analysis.score}/{analysis.out_of} rules passed
        </Text>
        {tier === "html" && (
          <Text style={[s.coverScoreSub, { marginTop: 2 }]}>
            Includes your new homepage file
          </Text>
        )}
      </View>

      <Text style={s.coverHeadline}>{analysis.headline}</Text>

      {screenshotUrl && (
        <View style={{ marginTop: 24, borderRadius: 6, overflow: "hidden", borderWidth: 1, borderColor: C.border }}>
          <Image
            src={screenshotUrl}
            style={{ width: "100%", height: 160, objectFit: "cover", objectPositionY: 0 }}
          />
          <Text style={{ fontSize: 8, color: C.muted, textAlign: "center", paddingVertical: 5 }}>
            {url.replace(/^https?:\/\//, "").replace(/\/$/, "")} at time of scan
          </Text>
        </View>
      )}

      <View style={s.coverFooter}>
        <Text style={s.coverFooterText}>
          Prepared by Grade My Site · grademy.site
        </Text>
      </View>
    </Page>
  );
}

function BiggestWinsPage({ analysis, url }: { analysis: FullAnalysis; url: string }) {
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const wins = (analysis.top_3_wins ?? []).filter(Boolean);

  return (
    <Page size="A4" style={s.page}>
      <PageHeader url={displayUrl} />
      <Text style={s.pageTitle}>Your 3 Biggest Wins</Text>
      <Text style={s.pageSub}>
        {["C", "D", "F"].includes(analysis.grade)
          ? "These are the three issues most likely costing you enquiries right now — and the fastest way to a better grade."
          : "These are the three issues most likely costing you enquiries right now. Fix these first."}
      </Text>

      {wins.length === 0 ? (
        <Text style={s.copyBody}>No top wins identified in this report.</Text>
      ) : (
        wins.map((win, i) => (
          <View key={i} style={s.winCard} wrap={false}>
            <Text style={s.winLabel}>Win {i + 1} — {win.rule_name ?? `Rule ${win.rule}`}</Text>
            <Text style={s.winImpact}>{win.impact}</Text>
            <Text style={s.winFix}>
              <Text style={s.winFixBold}>Fix: </Text>
              {win.fix}
            </Text>
          </View>
        ))
      )}
      <PageFooter />
    </Page>
  );
}

function ScorecardPage({ analysis, url }: { analysis: FullAnalysis; url: string }) {
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const unable = analysis.unable_to_assess ?? [];

  return (
    <Page size="A4" style={s.page}>
      <PageHeader url={displayUrl} />
      <Text style={s.pageTitle}>Your 22-Rule Scorecard</Text>

      <Text style={[s.sectionLabel, { color: C.green, marginTop: 0 }]}>
        What&apos;s Working ✓
      </Text>
      {analysis.passes.length === 0 ? (
        <Text style={s.ruleFinding}>No rules passed.</Text>
      ) : (
        analysis.passes.map((r, i) => <RuleRow key={i} r={r} pass />)
      )}

      <Text style={[s.sectionLabel, { color: C.red }]}>What Needs Fixing ✗</Text>
      {analysis.fails.length === 0 ? (
        <Text style={s.ruleFinding}>No issues found.</Text>
      ) : (
        analysis.fails.map((r, i) => <RuleRow key={i} r={r} />)
      )}

      {unable.length > 0 && (
        <>
          <Text style={[s.sectionLabel, { color: C.muted }]}>
            What We Couldn&apos;t Check –
          </Text>
          {unable.map((r, i) => <RuleRow key={i} r={r} unable />)}
        </>
      )}

      <PageFooter />
    </Page>
  );
}

function RewrittenCopyPage({ analysis, url }: { analysis: FullAnalysis; url: string }) {
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const copy = analysis.rewritten_copy;

  return (
    <Page size="A4" style={s.page}>
      <PageHeader url={displayUrl} />
      <Text style={s.pageTitle}>Your New Homepage Copy — Ready to Use</Text>
      <Text style={s.pageSub}>
        Hand this page to your developer, or use it to update your site yourself.
      </Text>

      <View style={s.copySection} wrap={false}>
        <Text style={s.copyLabel}>New Headline</Text>
        <Text style={s.copyHeadline}>{copy.headline}</Text>
      </View>

      <View style={s.copySection} wrap={false}>
        <Text style={s.copyLabel}>Subheadline</Text>
        <Text style={s.copySub}>{copy.subheadline}</Text>
      </View>

      {/* problem_section = external/factual problem (situational events)
          sound_familiar  = internal/emotional problem (how it feels) — must NOT restate problem_section */}
      <View style={s.copySection} wrap={false}>
        <Text style={s.copyLabel}>Problem Section</Text>
        {copy.problem_section.map((pt, i) => (
          <View key={i} style={s.copyBullet}>
            <Text style={s.copyBulletDot}>•</Text>
            <Text style={s.copyBulletText}>{pt}</Text>
          </View>
        ))}
      </View>

      {copy.sound_familiar && copy.sound_familiar.length > 0 && (
        <View style={s.copySection} wrap={false}>
          <Text style={s.copyLabel}>Sound Familiar?</Text>
          {copy.sound_familiar.map((pt, i) => (
            <View key={i} style={s.copyBullet}>
              <Text style={[s.copyBulletDot, { color: C.muted }]}>→</Text>
              <Text style={s.copyItalic}>&ldquo;{pt}&rdquo;</Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.copySection} wrap={false}>
        <Text style={s.copyLabel}>Primary Button Text</Text>
        <View style={s.ctaBox}>
          <Text style={s.ctaText}>{copy.primary_cta}</Text>
        </View>
      </View>

      {copy.section_headings && Object.keys(copy.section_headings).length > 0 && (
        <View style={s.copySection} wrap={false}>
          <Text style={s.copyLabel}>Suggested Section Headings</Text>
          {HEADING_ORDER
            .filter(k => copy.section_headings?.[k])
            .map(k => (
              <View key={k} style={s.headingsRow}>
                <Text style={s.headingsKey}>{k.replace("_", " ")}:</Text>
                <Text style={s.headingsVal}>{copy.section_headings![k]}</Text>
              </View>
            ))}
        </View>
      )}

      {copy.solution_bullets && copy.solution_bullets.length > 0 && (
        <View style={s.copySection} wrap={false}>
          <Text style={s.copyLabel}>Why Customers Choose You</Text>
          {copy.solution_bullets.map((bullet, i) => (
            <View key={i} style={s.copyBullet}>
              <Text style={s.copyBulletDot}>{i + 1}.</Text>
              <Text style={s.copyBulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      )}

      <PageFooter />
    </Page>
  );
}

function TestimonialsPage({
  analysis,
  url,
  tier,
}: {
  analysis: FullAnalysis;
  url: string;
  tier: string;
}) {
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const copy = analysis.rewritten_copy;

  return (
    <Page size="A4" style={s.page}>
      <PageHeader url={displayUrl} />
      <Text style={s.pageTitle}>Ask Your Customers These Questions</Text>
      <Text style={s.pageSub}>
        Real testimonials from real customers will do more for your homepage than any copy.
        Send these prompts to 2–3 recent customers.
      </Text>

      {copy.testimonial_suggestions.map((prompt, i) => (
        <View key={i} style={s.promptCard} wrap={false}>
          <Text style={s.promptNum}>Prompt {i + 1}</Text>
          <Text style={s.promptText}>&ldquo;{prompt}&rdquo;</Text>
        </View>
      ))}

      <Text style={[s.pageTitle, { fontSize: 13, marginTop: 24, marginBottom: 16 }]}>
        What To Do Now
      </Text>
      {[
        "Fix your 3 biggest wins first — they'll have the fastest impact on enquiries.",
        "Ask 2–3 recent customers the questions above and add their answers to your homepage.",
        "Hand this report to your developer, or update the page yourself using the copy on the previous page.",
      ].map((step, i) => (
        <View key={i} style={s.stepRow} wrap={false}>
          <View style={s.stepNum}>
            <Text style={s.stepNumText}>{i + 1}</Text>
          </View>
          <Text style={s.stepText}>{step}</Text>
        </View>
      ))}

      <View style={s.closingNote} wrap={false}>
        <Text style={s.closingNoteText}>
          {tier === "html"
            ? "Your new homepage file is also attached to this email — hand it to your developer with the instructions in the email."
            : "Want this turned into a ready-to-use homepage? Reply to your report email to find out more."}
        </Text>
      </View>

      <PageFooter />
    </Page>
  );
}

function BackCoverPage() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.backCoverWrap}>
        <LogoBrand iconSize={22} textStyle={s.backLogo} accentStyle={s.backLogoAccent} wrapperStyle={{ marginBottom: 8 }} />
        <Text style={s.backUrl}>grademy.site</Text>
        <Text style={s.backTagline}>Free website check for local businesses</Text>
        <Text style={s.backCopyright}>
          © Grade My Site {new Date().getFullYear()}
        </Text>
      </View>
    </Page>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateReportPdf(
  url: string,
  analysis: FullAnalysis,
  tier: "report" | "html",
  screenshotUrl?: string | null
): Promise<Buffer> {
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const doc = (
    <Document
      title={`Grade My Site Report — ${url.replace(/^https?:\/\//, "")}`}
      author="Grade My Site"
      creator="Grade My Site"
    >
      <CoverPage url={url} analysis={analysis} tier={tier} reportDate={reportDate} screenshotUrl={screenshotUrl} />
      <BiggestWinsPage analysis={analysis} url={url} />
      <ScorecardPage analysis={analysis} url={url} />
      <RewrittenCopyPage analysis={analysis} url={url} />
      <TestimonialsPage analysis={analysis} url={url} tier={tier} />
      <BackCoverPage />
    </Document>
  );

  return renderToBuffer(doc);
}
