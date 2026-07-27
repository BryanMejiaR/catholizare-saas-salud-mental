export const PORTAL_RESOURCE_TOPICS = [
  "ansiedad",
  "autoestima",
  "familia",
  "pareja",
  "fe_oracion",
  "duelo",
  "proposito"
] as const;

export type PortalResourceTopic = (typeof PORTAL_RESOURCE_TOPICS)[number];

export type PortalBlogRecommendation = {
  id: string;
  topic: PortalResourceTopic;
  title: string;
  description: string;
  href: string;
};

export const PORTAL_RESOURCE_TOPIC_LABELS: Record<PortalResourceTopic, string> = {
  ansiedad: "Ansiedad y salud mental",
  autoestima: "Autoestima y dignidad",
  familia: "Familia y limites",
  pareja: "Pareja",
  fe_oracion: "Fe, oracion y psicologia",
  duelo: "Duelo y esperanza",
  proposito: "Sentido de vida y proposito"
};

const PORTAL_BLOG_RECOMMENDATIONS: PortalBlogRecommendation[] = [
  {
    id: "blog-ansiedad-salud-mental-fe",
    topic: "ansiedad",
    title: "Psicologo catolico: cuidado de la salud mental y fe",
    description: "Orientacion general para saber cuando buscar ayuda profesional.",
    href: "https://catholizare.com/psicologo-catolico-salud-mental-fe/"
  },
  {
    id: "blog-autoestima-pareja",
    topic: "autoestima",
    title: "Autoestima y relacion de pareja",
    description: "Lectura sobre autoestima, vinculos y dependencia emocional.",
    href: "https://catholizare.com/afecta-tu-autoestima-a-tu-relacion-de-pareja/2/"
  },
  {
    id: "blog-dignidad-salud-mental",
    topic: "autoestima",
    title: "Dignidad humana y salud mental",
    description: "Una mirada de fe y salud mental cuando la persona se siente rota.",
    href: "https://catholizare.com/dignidad-humana-salud-mental-hijo-de-dios/"
  },
  {
    id: "blog-limites-familia-politica",
    topic: "familia",
    title: "Limites sanos sin romper la paz familiar",
    description: "Herramientas para limites, culpa y comunicacion familiar.",
    href: "https://catholizare.com/limites-con-suegros-sin-culpa/"
  },
  {
    id: "blog-psicologia-cristiana-familia",
    topic: "familia",
    title: "Psicologia cristiana para la familia",
    description: "Recursos sobre vinculos familiares y acompanamiento cristiano.",
    href: "https://catholizare.com/psicologia-cristiana-para-la-familia-catholizare/"
  },
  {
    id: "blog-autoestima-pareja-tema",
    topic: "pareja",
    title: "Autoestima en la relacion de pareja",
    description: "Lectura para revisar autoestima, comunicacion y vinculo de pareja.",
    href: "https://catholizare.com/afecta-tu-autoestima-a-tu-relacion-de-pareja/2/"
  },
  {
    id: "blog-psicologia-fe-oracion",
    topic: "fe_oracion",
    title: "La psicologia no reemplaza la fe ni la oracion",
    description: "Contenido sobre integracion entre ayuda psicologica, fe y oracion.",
    href: "https://catholizare.com/psicologia-reemplaza-fe-oracion/"
  },
  {
    id: "blog-duelo-esperanza",
    topic: "duelo",
    title: "Bienestar integral",
    description: "Categoria con articulos sobre duelo, salud mental y vida cotidiana.",
    href: "https://catholizare.com/category/salud-mental-y-antropologia/consultor-familiar/"
  },
  {
    id: "blog-proposito-tests",
    topic: "proposito",
    title: "Tests autoadministrables",
    description: "Recursos de orientacion sobre autoestima, ansiedad y sentido de vida.",
    href: "https://catholizare.com/category/test/"
  }
];

export function getPortalBlogRecommendations(selectedTopics: PortalResourceTopic[]) {
  const topics = selectedTopics.length > 0 ? selectedTopics : PORTAL_RESOURCE_TOPICS;
  const topicSet = new Set(topics);

  return PORTAL_BLOG_RECOMMENDATIONS.filter((recommendation) =>
    topicSet.has(recommendation.topic)
  ).slice(0, 8);
}
