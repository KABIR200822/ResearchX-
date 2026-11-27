/**
 * ResearchX v16 — offline mock evidence pipeline.
 *
 * The built-in AI topic pack is illustrative demo content, not retrieved
 * research and not a verified source. Other topics receive a useful
 * research brief plus an explicit notice that no matching demo pack exists.
 *
 * Replace this module's adapter with the real backend in the final API phase.
 */
const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const AI_DEMO_PACK = {
  topic: 'Artificial Intelligence',
  match: /\b(what is ai|what is artificial intelligence|artificial intelligence| ai )\b/i,
  overview: 'Artificial intelligence (AI) is a broad area of computing focused on building systems that perform tasks commonly associated with human cognitive abilities. These tasks can include recognising patterns, understanding language, making predictions, planning and generating content.',
  sections: [
    {
      heading: 'What AI means',
      body: 'AI is not a single technology. It is an umbrella term for methods that allow software or machines to interpret inputs, learn patterns, make recommendations or generate outputs. Some systems follow explicitly programmed rules; others learn statistical patterns from data.',
    },
    {
      heading: 'Major branches of AI',
      bullets: [
        'Machine learning: methods that learn patterns from data to make predictions or decisions.',
        'Deep learning: a family of machine-learning methods that use multi-layer neural networks.',
        'Natural language processing: techniques for working with human language, including classification, translation and text generation.',
        'Computer vision: methods for interpreting images and video.',
        'Robotics: the integration of sensing, planning and control with physical machines.',
      ],
    },
    {
      heading: 'How an AI system works',
      bullets: [
        'An input is supplied, such as text, an image, sensor readings or structured data.',
        'A model or rule system processes the input using its design and, where applicable, patterns learned during training.',
        'The system produces an output, such as a classification, prediction, recommendation or generated response.',
        'The output should be evaluated against the task, the quality of the data and the consequences of errors.',
      ],
    },
    {
      heading: 'Common applications',
      bullets: [
        'Healthcare: assisting with image review, workflow prioritisation and analysis of clinical data.',
        'Education: supporting tutoring, feedback and learning-resource adaptation.',
        'Finance: detecting unusual transaction patterns and supporting risk analysis.',
        'Transportation: perception, route planning and driver-assistance systems.',
        'Scientific research: helping analyse large datasets and explore candidate patterns.',
      ],
    },
    {
      heading: 'Limitations and risks',
      bullets: [
        'AI systems can reproduce biases present in training data or system design.',
        'Generated outputs can be inaccurate or fabricated and should be checked against reliable evidence.',
        'Performance can change when real-world inputs differ from the data or conditions used during development.',
        'Privacy, security, transparency, accountability and energy use require consideration.',
      ],
    },
  ],
  findings: [
    { id: 'F-01', claim: 'AI is an umbrella field rather than one single technique.', detail: 'The field includes rule-based approaches and data-driven methods such as machine learning, alongside areas including language processing, vision and robotics.', category: 'Definition' },
    { id: 'F-02', claim: 'Machine learning is one major approach within AI.', detail: 'Machine-learning methods use data to learn patterns that support predictions or decisions; deep learning is one family within machine learning.', category: 'Relationship' },
    { id: 'F-03', claim: 'AI systems produce outputs from inputs using rules or learned models.', detail: 'The output may be a prediction, classification, recommendation, plan or generated content, depending on the system.', category: 'How it works' },
    { id: 'F-04', claim: 'AI can be applied across multiple sectors.', detail: 'Examples include healthcare, education, finance, transportation and scientific research; suitability depends on task design and evaluation.', category: 'Applications' },
    { id: 'F-05', claim: 'AI outputs require evaluation and human oversight in consequential settings.', detail: 'Bias, unreliable outputs, privacy and security risks mean that system performance and limitations should be assessed.', category: 'Limitations' },
  ],
  sourceCards: [
    { id: 'D-01', title: 'AI foundations — demo knowledge card', kind: 'Synthetic demo material', note: 'A locally bundled explanatory summary used to demonstrate the pipeline. Not an external publication.' },
    { id: 'D-02', title: 'AI methods and applications — demo knowledge card', kind: 'Synthetic demo material', note: 'A locally bundled taxonomy and examples used to demonstrate analysis. Not an external publication.' },
    { id: 'D-03', title: 'AI risks and evaluation — demo knowledge card', kind: 'Synthetic demo material', note: 'A locally bundled list of common evaluation considerations. Not an external publication.' },
  ],
  limitations: [
    'This topic pack is illustrative local demo content, not live research.',
    'No external sources were searched or retrieved.',
    'The demo cards are not publications and must not be cited as real references.',
    'No independent fact-check or PDF text extraction was performed.',
  ],
};


const DEMO_PACKS = [
  {
    key: 'machine-learning',
    topic: 'Machine Learning',
    match: /\b(machine learning|supervised learning|unsupervised learning|reinforcement learning|ml algorithms?)\b/i,
    overview: 'Machine learning (ML) is a branch of artificial intelligence in which computer systems use data to learn patterns and make predictions or decisions without being explicitly programmed with a separate rule for every case.',
    sections: [
      { heading: 'What machine learning means', body: 'An ML workflow uses examples or experience to fit a model, then evaluates how well that model performs on data it has not seen during training.' },
      { heading: 'Main learning approaches', bullets: ['Supervised learning uses labelled examples for tasks such as classification and regression.', 'Unsupervised learning looks for structure in unlabelled data, such as clusters or lower-dimensional representations.', 'Reinforcement learning trains an agent to choose actions through feedback or rewards from an environment.'] },
      { heading: 'Typical workflow', bullets: ['Define the task and success metric.', 'Collect, inspect and prepare relevant data.', 'Choose a baseline and model family.', 'Train the model and tune it using validation data.', 'Evaluate on held-out data and monitor performance after deployment.'] },
      { heading: 'Applications', bullets: ['Spam and fraud detection.', 'Demand and price forecasting.', 'Recommendation and ranking systems.', 'Image and speech recognition.', 'Predictive maintenance and anomaly detection.'] },
      { heading: 'Limitations', bullets: ['Poor or unrepresentative data can produce unreliable models.', 'Overfitting can make training performance look better than real-world performance.', 'Models may reproduce historical bias.', 'Performance can drift as real-world data changes.'] },
    ],
    findings: [
      { id: 'ML-01', claim: 'Machine learning learns patterns from data to support predictions or decisions.', detail: 'A model is fitted using examples or feedback and then evaluated on unseen data.', category: 'Definition' },
      { id: 'ML-02', claim: 'Supervised, unsupervised and reinforcement learning are distinct learning approaches.', detail: 'They differ in the kind of training signal or feedback available to the learning system.', category: 'Methods' },
      { id: 'ML-03', claim: 'A reliable ML workflow requires evaluation on data not used for fitting.', detail: 'Held-out evaluation helps estimate how a model may perform beyond its training examples.', category: 'Evaluation' },
      { id: 'ML-04', claim: 'Data quality and representativeness affect model performance.', detail: 'Missing, noisy, biased or shifted data can undermine predictions.', category: 'Limitations' },
      { id: 'ML-05', claim: 'ML systems need monitoring after deployment.', detail: 'Changes in data and operating conditions can cause model performance to drift.', category: 'Deployment' },
    ],
    sourceCards: ['ML foundations — demo knowledge card', 'Learning approaches — demo knowledge card', 'Model evaluation — demo knowledge card'].map((title, i) => ({ id: `ML-D0${i+1}`, title, kind: 'Synthetic demo material', note: 'Locally bundled illustrative content; not an external publication.' })),
  },
  {
    key: 'deep-learning',
    topic: 'Deep Learning',
    match: /\b(deep learning|neural networks?|cnn|convolutional neural|transformers?)\b/i,
    overview: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers to learn representations from data. It is widely used for complex inputs such as images, audio, text and other high-dimensional data.',
    sections: [
      { heading: 'How neural networks work', body: 'A neural network passes input through layers of connected computational units. Training adjusts parameters so that the network reduces a chosen loss function on examples.' },
      { heading: 'Common architectures', bullets: ['Feedforward networks are used for general structured prediction tasks.', 'Convolutional neural networks are designed to capture local patterns and have been widely used in image processing.', 'Recurrent networks process sequences using recurrent connections.', 'Transformer models use attention mechanisms to process relationships between tokens or other input elements.'] },
      { heading: 'Training process', bullets: ['Prepare and split the dataset.', 'Choose a network architecture and loss function.', 'Run forward passes to generate predictions.', 'Use backpropagation and an optimiser to update parameters.', 'Evaluate on held-out data and tune the system.'] },
      { heading: 'Applications', bullets: ['Image classification and object detection.', 'Speech recognition and audio processing.', 'Language modelling and translation.', 'Medical image analysis support.', 'Time-series and sensor-data modelling.'] },
      { heading: 'Limitations', bullets: ['Training can require substantial data and compute.', 'Models can be difficult to interpret.', 'Performance depends on data quality and evaluation design.', 'Large models can be expensive to train and operate.'] },
    ],
    findings: [
      { id: 'DL-01', claim: 'Deep learning is a subset of machine learning based on multi-layer neural networks.', detail: 'The layers learn representations that can support complex prediction tasks.', category: 'Definition' },
      { id: 'DL-02', claim: 'Neural-network training adjusts parameters to reduce a loss function.', detail: 'Backpropagation computes gradients that an optimiser uses to update model parameters.', category: 'Training' },
      { id: 'DL-03', claim: 'Different neural architectures are suited to different data structures and tasks.', detail: 'Convolutional, recurrent and attention-based designs encode different assumptions about inputs.', category: 'Architectures' },
      { id: 'DL-04', claim: 'Deep learning can be compute- and data-intensive.', detail: 'Large networks may require specialised hardware, careful training and significant energy.', category: 'Resources' },
      { id: 'DL-05', claim: 'Strong benchmark performance does not remove the need for real-world evaluation.', detail: 'Deployment conditions, data shifts, interpretability and error costs still matter.', category: 'Evaluation' },
    ],
    sourceCards: ['Neural network foundations — demo knowledge card', 'Deep learning architectures — demo knowledge card', 'Training and evaluation — demo knowledge card'].map((title, i) => ({ id: `DL-D0${i+1}`, title, kind: 'Synthetic demo material', note: 'Locally bundled illustrative content; not an external publication.' })),
  },
  {
    key: 'generative-ai',
    topic: 'Generative AI',
    match: /\b(generative ai|gen ai|large language models?|llms?|chatgpt|text generation|image generation)\b/i,
    overview: 'Generative AI refers to models that create new content, such as text, images, audio, video or code, by learning patterns from training data. Large language models are one important class of generative model focused on language.',
    sections: [
      { heading: 'What generative AI does', body: 'A generative model learns statistical structure in data and uses that learned structure to produce new outputs in response to a prompt or other conditioning input.' },
      { heading: 'How language models generate text', bullets: ['Text is represented as tokens.', 'The model processes the token context.', 'It estimates a probability distribution over possible next tokens.', 'Tokens are generated iteratively until a stopping condition is reached.', 'The prompt, model design and decoding settings influence the result.'] },
      { heading: 'Common model families', bullets: ['Large language models generate and transform text and code.', 'Diffusion models generate content by iteratively denoising a representation.', 'Multimodal models work across combinations of text, images, audio or video.'] },
      { heading: 'Applications', bullets: ['Drafting, summarisation and translation.', 'Coding assistance and explanation.', 'Creative image, audio and video generation.', 'Question answering over supplied documents.', 'Conversational interfaces and workflow assistance.'] },
      { heading: 'Risks and limitations', bullets: ['Outputs can contain factual errors or fabricated details.', 'Training data may create bias or copyright and privacy concerns.', 'Generated content can be misused for impersonation or misinformation.', 'Human review is important for consequential decisions.'] },
    ],
    findings: [
      { id: 'GAI-01', claim: 'Generative AI models create new content based on patterns learned from data.', detail: 'Outputs may include text, images, audio, video or code depending on the model.', category: 'Definition' },
      { id: 'GAI-02', claim: 'Many language models generate text by predicting tokens sequentially.', detail: 'The model repeatedly estimates likely next tokens conditioned on the preceding context.', category: 'Mechanism' },
      { id: 'GAI-03', claim: 'Generative AI can support drafting, summarisation, coding and creative workflows.', detail: 'The usefulness of each application depends on task constraints and output review.', category: 'Applications' },
      { id: 'GAI-04', claim: 'Fluent generated output is not proof that its claims are correct.', detail: 'Outputs can be plausible but inaccurate, incomplete or unsupported.', category: 'Reliability' },
      { id: 'GAI-05', claim: 'Responsible use requires attention to privacy, bias, provenance and misuse.', detail: 'Risk controls should reflect the content, users and consequences of the application.', category: 'Governance' },
    ],
    sourceCards: ['Generative model overview — demo knowledge card', 'Language model workflow — demo knowledge card', 'Generative AI risks — demo knowledge card'].map((title, i) => ({ id: `GAI-D0${i+1}`, title, kind: 'Synthetic demo material', note: 'Locally bundled illustrative content; not an external publication.' })),
  },
  {
    key: 'cybersecurity',
    topic: 'Cybersecurity',
    match: /\b(cyber ?security|information security|network security|phishing|malware|ransomware|encryption)\b/i,
    overview: 'Cybersecurity is the practice of protecting systems, networks, applications and data from unauthorised access, disruption, damage and misuse. It combines technical controls, processes and user awareness.',
    sections: [
      { heading: 'Core security goals', bullets: ['Confidentiality limits access to information to authorised parties.', 'Integrity protects information and systems from unauthorised alteration.', 'Availability helps ensure systems and data remain accessible when needed.'] },
      { heading: 'Common threats', bullets: ['Phishing attempts to trick people into revealing information or taking unsafe actions.', 'Malware is software designed to disrupt, damage or gain unauthorised access.', 'Ransomware can encrypt or otherwise deny access to data and demand payment.', 'Credential attacks target passwords, tokens or authentication systems.', 'Unpatched vulnerabilities can expose systems to exploitation.'] },
      { heading: 'Practical safeguards', bullets: ['Use unique passwords and a password manager.', 'Enable multi-factor authentication.', 'Apply security updates promptly.', 'Keep tested backups of important data.', 'Use least-privilege access and monitor unusual activity.', 'Train users to recognise suspicious messages and links.'] },
      { heading: 'Incident response', bullets: ['Prepare roles, contacts and response procedures.', 'Identify and contain the incident.', 'Remove the cause and restore from trusted backups.', 'Review what happened and improve controls.'] },
      { heading: 'Limitations', bullets: ['No single tool prevents every attack.', 'Human and third-party risks remain important.', 'Controls must be maintained as systems and threats change.'] },
    ],
    findings: [
      { id: 'CY-01', claim: 'Confidentiality, integrity and availability are core information-security objectives.', detail: 'Security controls commonly aim to preserve all three properties.', category: 'Principles' },
      { id: 'CY-02', claim: 'Phishing commonly relies on social engineering rather than a technical exploit alone.', detail: 'Attackers try to persuade users to disclose credentials, open malicious content or approve actions.', category: 'Threats' },
      { id: 'CY-03', claim: 'Multi-factor authentication reduces reliance on passwords as the only authentication factor.', detail: 'A second factor can make stolen passwords less sufficient on their own.', category: 'Controls' },
      { id: 'CY-04', claim: 'Patching and tested backups are important parts of cyber resilience.', detail: 'Updates address known weaknesses, while recoverable backups can support restoration.', category: 'Resilience' },
      { id: 'CY-05', claim: 'Incident response requires preparation, containment, recovery and learning.', detail: 'A documented process helps teams coordinate under pressure.', category: 'Response' },
    ],
    sourceCards: ['Security principles — demo knowledge card', 'Threats and safeguards — demo knowledge card', 'Incident response — demo knowledge card'].map((title, i) => ({ id: `CY-D0${i+1}`, title, kind: 'Synthetic demo material', note: 'Locally bundled illustrative content; not an external publication.' })),
  },
  {
    key: 'blockchain',
    topic: 'Blockchain',
    match: /\b(blockchain|distributed ledger|cryptocurrency|smart contracts?|bitcoin|ethereum)\b/i,
    overview: 'A blockchain is a type of distributed ledger in which records are grouped into blocks and linked using cryptographic techniques. Network participants follow a consensus mechanism to agree on the ledger state.',
    sections: [
      { heading: 'How a blockchain works', bullets: ['Transactions are submitted to a network.', 'Network nodes validate transactions according to protocol rules.', 'A consensus mechanism determines which proposed records are accepted.', 'Accepted records are grouped into blocks and linked to earlier blocks.', 'Participants update their view of the ledger.'] },
      { heading: 'Important concepts', bullets: ['A distributed ledger is replicated across multiple network participants.', 'Cryptographic hashes help link records and reveal changes.', 'Consensus mechanisms coordinate agreement about ledger updates.', 'Smart contracts are programs executed by a blockchain platform.'] },
      { heading: 'Potential uses', bullets: ['Digital asset transfers.', 'Shared records across organisations.', 'Tokenisation and programmable financial applications.', 'Audit trails and provenance experiments.'] },
      { heading: 'Trade-offs and limitations', bullets: ['Public networks can face throughput and latency constraints.', 'Some consensus designs consume significant energy.', 'Smart-contract bugs can be difficult to reverse.', 'Governance, privacy, regulation and user experience remain challenging.'] },
    ],
    findings: [
      { id: 'BC-01', claim: 'A blockchain is a distributed ledger that links records using cryptographic techniques.', detail: 'Blocks reference prior blocks, creating a history that is difficult to alter unnoticed under the network protocol.', category: 'Definition' },
      { id: 'BC-02', claim: 'Consensus mechanisms help network participants agree on ledger updates.', detail: 'Different networks use different mechanisms with distinct security, performance and resource trade-offs.', category: 'Mechanism' },
      { id: 'BC-03', claim: 'Smart contracts are programs executed by a blockchain platform.', detail: 'They can encode rules for transactions or other on-chain actions.', category: 'Concepts' },
      { id: 'BC-04', claim: 'Blockchain applications involve trade-offs in scalability, cost, privacy and governance.', detail: 'The design may not be suitable where a conventional database is simpler or more efficient.', category: 'Trade-offs' },
      { id: 'BC-05', claim: 'A blockchain does not automatically guarantee that input data is true.', detail: 'The ledger can preserve submitted records, but off-chain facts still require trustworthy data collection.', category: 'Limitations' },
    ],
    sourceCards: ['Blockchain foundations — demo knowledge card', 'Consensus and smart contracts — demo knowledge card', 'Blockchain trade-offs — demo knowledge card'].map((title, i) => ({ id: `BC-D0${i+1}`, title, kind: 'Synthetic demo material', note: 'Locally bundled illustrative content; not an external publication.' })),
  },
];

function getDemoPack(plan) {
  if (plan.topicPack === 'ai-foundations') return AI_DEMO_PACK;
  return DEMO_PACKS.find(pack => pack.key === plan.topicPack) || null;
}

function makeResearchPlan(question) {
  const q = clean(question);
  const lower = q.toLowerCase();
  const matchedDemo = [...DEMO_PACKS, { key: 'ai-foundations', ...AI_DEMO_PACK }].find(pack => pack.match.test(` ${lower} `));
  const matchedPack = matchedDemo?.key || null;
  const compare = /\b(compare|versus|vs\.?|difference|better)\b/.test(lower);
  return {
    question: q,
    topicPack: matchedPack,
    intent: compare ? 'comparative' : 'exploratory',
    searchQueries: [q, `${q} key concepts`, `${q} applications limitations`],
    subQuestions: compare
      ? ['What is being compared?', 'What criteria matter?', 'Where do the approaches differ?']
      : ['What does the topic mean?', 'How does it work?', 'What are its applications and limitations?'],
    scope: 'Introductory overview with definitions, mechanisms, applications and limitations.',
  };
}

function researcherAgent(plan) {
  const pack = getDemoPack(plan);
  if (pack) {
    return {
      status: 'demo-material-found',
      summary: 'Matched the question to the built-in AI foundations demo pack and selected three illustrative knowledge cards.',
      queries: plan.searchQueries,
      sourceCards: pack.sourceCards,
      topicOverview: pack.overview,
      notice: 'These are synthetic local demo cards, not retrieved sources.',
    };
  }
  return {
    status: 'no-matching-demo-pack',
    summary: 'Created a topic-specific discovery plan, but no matching local demo knowledge pack is available.',
    queries: plan.searchQueries,
    sourceCards: [],
    notice: 'No external search was performed. Add a matching demo pack or connect a search API in the final integration phase.',
  };
}

function analystAgent(plan, research) {
  const pack = getDemoPack(plan);
  if (pack) {
    return {
      status: 'demo-analysis-complete',
      summary: `Analysed ${pack.findings.length} illustrative findings across ${pack.sections.length} report sections.`,
      findings: pack.findings,
      reportSections: pack.sections,
      synthesis: pack.overview,
      analysisNotes: [
        'AI is a broad field with multiple technical approaches.',
        'Machine learning and deep learning are related but not interchangeable terms.',
        'Applications should be evaluated in the context of the task and its risks.',
      ],
    };
  }
  return {
    status: 'awaiting-evidence',
    summary: 'Prepared a topic framework, but there is no local evidence pack to analyse.',
    findings: [],
    reportSections: [
      { heading: 'Topic overview', body: `This research brief concerns: ${plan.question}. A substantive evidence-based explanation cannot be generated from the current offline demo dataset.` },
      { heading: 'Questions to investigate', bullets: plan.subQuestions },
      { heading: 'Analysis plan', bullets: ['Define key terms and scope.', 'Identify primary and independent sources.', 'Extract findings with source and page-level provenance.', 'Compare methods, populations, dates and limitations.'] },
    ],
    synthesis: 'No topic-specific demo evidence is available. The output is a research brief, not a completed research synthesis.',
    analysisNotes: ['No claims were inferred from the prompt alone.', 'No external information was retrieved.'],
  };
}

function factCheckerAgent(plan, research, analysis) {
  const checks = analysis.findings.map(item => ({
    findingId: item.id,
    claim: item.claim,
    status: 'not-independently-verified',
    reason: 'The claim appears in the local demo pack, but no independent source was retrieved for corroboration.',
  }));
  return {
    status: checks.length ? 'reviewed-not-verified' : 'awaiting-evidence',
    summary: checks.length
      ? `Reviewed ${checks.length} demo findings for traceability. None is labelled independently verified.`
      : 'No evidence claims were available for comparison.',
    checks,
    contradictions: [],
    unresolved: checks.length,
    protocol: [
      'Match claims that address the same concept, population, timeframe and outcome.',
      'Compare source independence, methods, definitions and measurement units.',
      'Record supporting and contradicting passages with page or section references.',
      'Keep claims unresolved when independent evidence is unavailable.',
    ],
    notice: 'The mock fact-checker checks record completeness only; it does not establish factual truth.',
  };
}

function reportWriterAgent(plan, research, analysis, verification) {
  const pack = getDemoPack(plan);
  const hasFindings = analysis.findings.length > 0;
  return {
    title: pack ? `Understanding ${pack.topic || 'the topic'}` : plan.question,
    status: hasFindings ? 'ILLUSTRATIVE DEMO SYNTHESIS · NOT VERIFIED' : 'RESEARCH BRIEF · EVIDENCE NEEDED',
    executiveSummary: hasFindings
      ? `${analysis.synthesis} This report demonstrates how ResearchX can turn structured findings into a readable synthesis. The material comes from a bundled illustrative demo pack, not live research, and the claims have not been independently verified.`
      : `ResearchX has created a focused research brief for “${plan.question}”. It has identified the questions and analysis steps needed, but the offline demo dataset contains no matching evidence. This is not yet a completed research answer.`,
    sections: hasFindings
      ? [
          { heading: 'Introduction', body: analysis.synthesis },
          ...analysis.reportSections,
          { heading: 'Key findings', findings: analysis.findings },
          { heading: 'Verification outcome', body: `The mock fact-checker reviewed ${verification.checks.length} findings for traceability. ${verification.unresolved} remain unverified because independent sources were not retrieved. No contradictions are asserted.` },
        ]
      : analysis.reportSections,
    findings: analysis.findings,
    references: [],
    demoMaterials: research.sourceCards,
    evidenceCount: analysis.findings.length,
    verificationSummary: verification.summary,
    limitations: hasFindings ? ['This topic pack is illustrative local demo content, not live research.', 'No external sources were searched or retrieved.', 'Demo cards are not publications and must not be cited as real references.', 'No independent fact-check or PDF text extraction was performed.'] : [
      'No live web retrieval was performed.',
      'No matching local demo knowledge pack is available for this topic.',
      'No claims have been independently corroborated.',
      'No factual citations are generated.',
    ],
    provenance: hasFindings ? `Bundled synthetic ${pack?.topic || 'demo'} knowledge pack` : 'Local research brief generated from the prompt',
  };
}

export function runMockResearchPipeline({ question, documents = [], options = {} }) {
  const plan = makeResearchPlan(question);
  const research = researcherAgent(plan);
  const analysis = analystAgent(plan, research);
  const verification = factCheckerAgent(plan, research, analysis);
  const report = reportWriterAgent(plan, research, analysis, verification);

  return {
    id: `mock-${Date.now()}`,
    mode: 'mock',
    question: plan.question,
    createdAt: new Date().toISOString(),
    options,
    stages: [
      { id: 'researcher', name: 'Researcher', status: 'complete', summary: research.summary, output: research },
      { id: 'analyst', name: 'Analyst', status: 'complete', summary: analysis.summary, output: analysis },
      { id: 'fact-checker', name: 'Fact-checker', status: 'complete', summary: verification.summary, output: verification },
      { id: 'report-writer', name: 'Report writer', status: 'complete', summary: hasText(report.executiveSummary) ? 'Generated a substantive report from the analyst output, with verification limitations clearly disclosed.' : 'Prepared a research brief.', output: report },
    ],
    report,
    limitations: report.limitations,
    documents: documents.map(file => ({
      name: clean(file.name),
      size: file.size || null,
      status: 'attached-not-analysed',
      note: 'PDF content extraction is not implemented in offline mock mode.',
    })),
  };
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
