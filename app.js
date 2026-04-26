const papers = window.RESEARCH_PAPERS;
const quickQueries = window.QUICK_QUERIES;

const conceptLexicon = {
  phd: ["doctoral", "doctorate", "graduate", "researcher", "candidate"],
  wellbeing: ["mental health", "stress", "burnout", "belonging", "support", "wellness"],
  ai: ["machine learning", "llm", "language model", "transformer", "semantic", "embeddings"],
  climate: ["adaptation", "resilience", "heat", "coastal", "drought", "environment"],
  healthcare: ["clinical", "public health", "maternal health", "community health", "medical"],
  equity: ["inclusion", "bias", "rural", "disability", "gender", "underrepresented"],
  review: ["screening", "evidence synthesis", "systematic review", "meta research"],
  policy: ["governance", "regulation", "institutional", "implementation"],
  africa: ["kenya", "nigeria", "ghana", "south africa", "ethiopia"],
  education: ["higher education", "universities", "doctoral", "student support", "learning"]
};

const stopWords = new Set([
  "the", "and", "for", "with", "that", "this", "from", "into", "using", "through",
  "about", "their", "them", "have", "has", "had", "been", "are", "was", "were",
  "how", "what", "where", "when", "your", "into", "than", "over", "under", "between"
]);

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
}

function tokenize(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((token) => token && !stopWords.has(token));
}

function buildConceptVector(text) {
  const normalized = normalize(text);
  const tokens = tokenize(text);
  const vector = {};

  for (const token of tokens) {
    vector[token] = (vector[token] || 0) + 1;
  }

  for (const [concept, synonyms] of Object.entries(conceptLexicon)) {
    let score = 0;

    if (tokens.includes(concept)) {
      score += 2;
    }

    for (const synonym of synonyms) {
      if (normalized.includes(synonym)) {
        score += 1.5;
      }
    }

    if (score > 0) {
      vector[`concept:${concept}`] = score;
    }
  }

  return vector;
}

function cosineSimilarity(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;

  for (const key of keys) {
    const av = a[key] || 0;
    const bv = b[key] || 0;
    dot += av * bv;
    aNorm += av * av;
    bNorm += bv * bv;
  }

  if (!aNorm || !bNorm) {
    return 0;
  }

  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
}

function paperText(paper) {
  return [
    paper.title,
    paper.abstract,
    paper.domain,
    paper.population,
    paper.methods.join(" "),
    paper.keywords.join(" "),
    paper.gapSignals.join(" "),
    paper.countries.join(" ")
  ].join(" ");
}

const enrichedPapers = papers.map((paper) => ({
  ...paper,
  vector: buildConceptVector(paperText(paper))
}));
