import type { PinterestPin } from "./pinpilot";

/** Private editorial originals stay in Drive/Notion, not copied into this public GitHub repo.
 * Draft only: source-language copy is preserved for owner revision, not an approved ad. */
export type SourcedCarouselPin = PinterestPin & {
  sourceUrl: string;
  assetsUrl?: string;
  slideUrls: string[];
  slideCount: number;
  reviewNote: string;
};

const originals: Array<{
  id: string; title: string; description: string; link: string; board: string;
  sourceUrl: string; assetsUrl?: string; slideUrls: string[]; slideCount: number; reviewNote: string;
}> = [
  {
    "id": "tle-character-pantera-rosa",
    "title": "Pantera Rosa · Mucho estilo. ¿Y tu web?",
    "description": "La Vie in Pink: identidad de cafetería boutique, fotografía, ambiente y menú explorables. Cómo hacer que una marca se sienta también en su website.",
    "link": "https://thelaunchera.com/demos/la-vie-in-pink/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1bRGJ9ujVfxUyLcS27FoiwxiRGOqju04g",
    "slideUrls": [
      "https://drive.google.com/file/d/1scxwc3Nu0Eajahkj_AUf7wD-apdI3Aio/view",
      "https://drive.google.com/file/d/1nyGdeK-frB36lHzVktQmm1z7u9kHK9EI/view",
      "https://drive.google.com/file/d/1NqlJNOXUbsDnnolBukcDgN7Z4ykzCqqj/view",
      "https://drive.google.com/file/d/1ku_8oRfgh9QqU9qf6FDG_nRjZFzbtYV4/view",
      "https://drive.google.com/file/d/16Ci6hxNerlJhM-Tves2ohHqCt-GUyscz/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-supergirl",
    "title": "Supergirl · Dale superpoderes a tu web",
    "description": "Golden Grid: producto, ficha y formulario de consulta. Revisa que el recorrido sea claro entre secciones y pantallas.",
    "link": "https://thelaunchera.com/demos/golden-grid/#collection",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/19njH72l6j0p_9jROKYil4D8-uLUGFCVJ",
    "slideUrls": [
      "https://drive.google.com/file/d/1OJBY1T00JZeOJ0qaXOz9bz1-OZT8b003/view",
      "https://drive.google.com/file/d/1xdtGB-5cWdwRdKhKXZHNJJJxQks0Qu_N/view",
      "https://drive.google.com/file/d/13c97XM2kp98Hl9XWYtxoUP8RnLifJYJ7/view",
      "https://drive.google.com/file/d/1z93Mv_IPJiurUe4JHvYchS-TTz_DwTTf/view",
      "https://drive.google.com/file/d/1s3c-RZnm3A4HdfYKK8R8u8y6FrhJnpIK/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-kim-possible",
    "title": "Kim Possible · Misión: lanzar tu website",
    "description": "Antes de pedirle a ChatGPT que diseñe una web, define qué vendes, para quién es y qué acción debe realizar la visita. Demo Casa Brownie. Mantener referencia a la clase para editar después.",
    "link": "https://thelaunchera.com/demos/casa-brownie/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1F22JUKoNbtc7O5mkE9VzZh_rnBN3KQQZ",
    "slideUrls": [
      "https://drive.google.com/file/d/1-jEd9eO83IWLuL4hbOFLhF7vLZi4E6IQ/view",
      "https://drive.google.com/file/d/1hYWY9dZIHXQE7o0AnAZ95Iv6AeO5anSS/view",
      "https://drive.google.com/file/d/18xfqu6UoKMnFyByoposqEa2BtuAZETRY/view",
      "https://drive.google.com/file/d/1jMGaq6Rh7AIxjbZYs2nnETruV1OjSlgA/view",
      "https://drive.google.com/file/d/1PiXnloVQMzV9-GIdhtUL8fb8KO06HOKz/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-catwoman",
    "title": "Catwoman · Tu web perdió su encanto",
    "description": "Jaramillo Boutique: elegir la foto hero y su encuadre para transmitir la identidad de una marca de moda.",
    "link": "https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/12RXU6V5rGjJLriwP1sP-ngLYmbFUs8vP",
    "slideUrls": [
      "https://drive.google.com/file/d/14JNYagyzo7cEo-XT7gSme2RRAfN45g7g/view",
      "https://drive.google.com/file/d/1yFduIh3-euT-3MJm5PEcxSes3w_1x1LP/view",
      "https://drive.google.com/file/d/13Px-IEC937XzhBa7I65wLN30KzK6SBa_/view",
      "https://drive.google.com/file/d/1isr5Q02pGPYZIxPbfwCRmJLHfAAuudcc/view",
      "https://drive.google.com/file/d/1zz4Wih-FOLHBMAW4OrYDbKWrISacINCz/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-reina-de-hielo",
    "title": "Reina de hielo · ¿Tu web quedó congelada?",
    "description": "SOVA: fotografía y tipografía que responden al tamaño de pantalla sin perder coherencia visual.",
    "link": "https://thelaunchera.com/demos/sova/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1VTOrM0DqliK-2_e4PwQ2vQZOTpEEcsch",
    "slideUrls": [
      "https://drive.google.com/file/d/1LL_SHzH9FIHCyIfJPRiBb-pGHFjV19nI/view",
      "https://drive.google.com/file/d/1-FkxHF9Q8tNYD5VAEwfnGtdQNvpUyOHD/view",
      "https://drive.google.com/file/d/16NGmcQwG9LsEMqOohgmu0mezOILvcg8P/view",
      "https://drive.google.com/file/d/1mqvel6v524vmjltu1f0iQFnEkBd5SZMX/view",
      "https://drive.google.com/file/d/1A2TO90VTxh3MXujJJPzVCjM6_8CRnxEo/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-zorra-aventurera",
    "title": "Zorra aventurera · Tu idea merece un website",
    "description": "Ejemplo de taller de cerámica: oferta, cliente, recorrido y estilo. Preguntas antes de crear un concepto de web con IA.",
    "link": "https://thelaunchera.com/website-for-your-business/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1f1_kQmTPmCHN_nGuDwbHFtA7CMAqCuWD",
    "slideUrls": [
      "https://drive.google.com/file/d/1OgHnIywG4ws5tq7Q5Q1NUG4t-p7LK483/view",
      "https://drive.google.com/file/d/1Gu0hOn3DDARWkZ0yMkiAr6sGcYINN2L2/view",
      "https://drive.google.com/file/d/1zXnrHhxN-5K8oKeH3U8jo9RP43BHWhGv/view",
      "https://drive.google.com/file/d/1-1182yml4yqw-84VKJW9ZHe-RqQfhUmp/view",
      "https://drive.google.com/file/d/1p4YLf0x3SXpbmSnQPgdeG1xo4lQVNCMZ/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-wonder-woman",
    "title": "Wonder Woman · Tu web merece más poder",
    "description": "Golden Grid: del empaque a la ficha de producto con una dirección de arte coherente.",
    "link": "https://thelaunchera.com/demos/golden-grid/#collection",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1tAEhXyGVx-ckipBcSKkR8atvpaXOVRMf",
    "slideUrls": [
      "https://drive.google.com/file/d/1tTcci-OOrOkrIH7Ue13ivLLF1AzK3jgH/view",
      "https://drive.google.com/file/d/1_g3C7rSlAi6AQHPvOu0sBKGtBnnV9wDG/view",
      "https://drive.google.com/file/d/1doR-ZSyKQaYYSwerb398iqmUvehQRjZz/view",
      "https://drive.google.com/file/d/1E2fv5YHNu-2wyvaBb3xjKdU45fOaFELY/view",
      "https://drive.google.com/file/d/1z2QBAXPukfiJn-gGd2TvnWJQam1nQcvI/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-agente-futurista",
    "title": "Agente futurista · Guárdalo. Vuelve después.",
    "description": "Lavender Edit: lista de favoritos que permite volver a explorar un producto antes de decidir.",
    "link": "https://thelaunchera.com/demos/lavender-edit/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1-QKJWjYcQIyGNjmn94Q1ZpAX-LEPrV_o",
    "slideUrls": [
      "https://drive.google.com/file/d/1ZAAHYHG71gYPrGbvwlhmGrBlX_UZId7L/view",
      "https://drive.google.com/file/d/1wsUy_gZzMrsgubq3INybdgU3_uHV-ihO/view",
      "https://drive.google.com/file/d/1Fjm4ffULMFGZL0xYxW8wQ6qOBnKJMa1V/view",
      "https://drive.google.com/file/d/1n1QmOjP5pVZs66xaNWbsfkF_eY6z7nFG/view",
      "https://drive.google.com/file/d/1-Un09X5Z9HGqIblcs2T0U7h6XTpQvHe8/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-tigresa",
    "title": "Tigresa · ¿Te gusta? ¿Hay tu talla?",
    "description": "Sneekiefs: muestra la selección de una talla dentro de una ficha de producto.",
    "link": "https://thelaunchera.com/demos/sneekiefs/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1lOye00Z-VLlCh8X_OFQ1o55Ufa9Zb4n4",
    "slideUrls": [
      "https://drive.google.com/file/d/1-s5PEVmhOwVdHPxB5aBLcwIsRxfd_jtc/view",
      "https://drive.google.com/file/d/1qlwnIV9Va1LU3QyhKHjZg-qpD-znKFvS/view",
      "https://drive.google.com/file/d/1Cm7r2t1W-Tx_vaWLywtrWNXatwxf60kP/view",
      "https://drive.google.com/file/d/1BOXMJP2fVzgZaVE0LpDiLKgjYn8fVrdk/view",
      "https://drive.google.com/file/d/1xKwJDzsxAeluCug1olVrqwG1OTTYHvwv/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-gatita-glam",
    "title": "Gatita glam · Una caja a tu gusto.",
    "description": "YUMMM: elegir favoritos, empaque y revisar el subtotal estimado en una demo.",
    "link": "https://thelaunchera.github.io/demo-booking-landing-/yummm/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1KXeGy4GGK6UMVR08bFic8s7TOmjgxnZM",
    "slideUrls": [
      "https://drive.google.com/file/d/10cJxQKKnnvu0LfNTO2qu1qWs8YJkL5nx/view",
      "https://drive.google.com/file/d/1DIVUl73YP-REHchKYtNCCM34_3yZSgQ_/view",
      "https://drive.google.com/file/d/1WnWT8L-JVUsULx1575Jv8N-Xxwo17NME/view",
      "https://drive.google.com/file/d/1CI7jTZKJ0J3iSh2yDOuDoVg8dncIm7gx/view",
      "https://drive.google.com/file/d/1ii88zsymcpcshrfdJHR4HZqIATPUCTkF/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-conejita-detective",
    "title": "Conejita detective · Tu cita en tres toques.",
    "description": "Nail Room: elegir un servicio y consultar horarios con ese servicio visible.",
    "link": "https://thelaunchera.github.io/demo-booking-landing-/nail-room/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/1Hnl_VKG5ra4PF6hztA04CSkgU9WiFPFx",
    "slideUrls": [
      "https://drive.google.com/file/d/1D3HK3SfXc2sf7Ej7_3csYiZrkx_2C0nb/view",
      "https://drive.google.com/file/d/1b-RQeRmaLivJVPa__NOb_UTtPdhi77YM/view",
      "https://drive.google.com/file/d/1LAOBantqZKtQQGME6ujNN0p9KfUuzctl/view",
      "https://drive.google.com/file/d/18BpqmkKfpVoAF82IwiseEph31C5WBSwq/view",
      "https://drive.google.com/file/d/11dpEG6TRHqD_f4hUnmq9Aiu_pwevzlrb/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-character-exploradora",
    "title": "Exploradora · La noche empieza en la web.",
    "description": "AFTR muestra la restricción 21+ desde la primera pantalla de su demo.",
    "link": "https://thelaunchera.com/demos/aftr/",
    "board": "Personajes · Websites + IA",
    "sourceUrl": "https://app.notion.com/p/413a68f2ee6e81379139f6cd20384b96",
    "assetsUrl": "https://drive.google.com/drive/folders/19i2dcXyUeL-xNnfirJE5KidyHZpQaKBL",
    "slideUrls": [
      "https://drive.google.com/file/d/1jznFaGRPpU9LsnBZdQac-SFYKaZ8uYA3/view",
      "https://drive.google.com/file/d/1CBuviaFm7Ktp_6ZQCpuQA7ZPhT7w8oPC/view",
      "https://drive.google.com/file/d/1XeUqTYztyfHSWrNe8vJHCSkVH2yTR_u-/view",
      "https://drive.google.com/file/d/1RppLMg_XFKteHLbvaROSAxs5PiXI65c0/view",
      "https://drive.google.com/file/d/1j-bCyrvkCI9picJk_AtsdKXm2Ttd6-1S/view"
    ],
    "slideCount": 5,
    "reviewNote": "Serie privada: cinco slides PNG originales; conservar ideas, demos y menciones a IA o clase hasta revisión. Texto en español; revisar inglés antes de publicación."
  },
  {
    "id": "tle-freebie-prompt-carousel",
    "title": "Freebie · No todo se arregla copiando otro prompt",
    "description": "Empieza por una buena foto, define lo que NO debe cambiar y revisa letras, forma y color. Los 8 Master Prompts gratuitos están disponibles en el enlace.",
    "link": "https://podcast.thelaunchera.com/content-lab/prompts/",
    "board": "Freebies · Carruseles creativos",
    "sourceUrl": "https://app.notion.com/p/40ba68f2ee6e8122850bd9c9a13762d3",
    "slideUrls": [],
    "slideCount": 4,
    "reviewNote": "4 imágenes adjuntas en Notion; edición en revisión. No publicar todavía."
  },
  {
    "id": "tle-freebie-idea-carousel",
    "title": "Freebie / Content Lab · No necesitas tres ideas",
    "description": "Una sola idea de matcha se convierte en single, carrusel y Story. La creatividad está en cambiar la intención, no copiar diseños.",
    "link": "https://podcast.thelaunchera.com/content-lab/",
    "board": "Freebies · Carruseles creativos",
    "sourceUrl": "https://app.notion.com/p/40ba68f2ee6e81ed8e20f9d883306cbd",
    "slideUrls": [],
    "slideCount": 4,
    "reviewNote": "4 imágenes adjuntas en Notion. Aún requieren revisar continuidad visual."
  },
  {
    "id": "tle-freebie-lavender-carousel",
    "title": "Freebie · The Lavender Edit — 8 fotos + CTA",
    "description": "Ocho maneras de presentar el lavanda con una misma dirección de arte. Material editorial guardado; la activación y entrega del freebie aún requieren comprobación.",
    "link": "",
    "board": "Freebies · Carruseles creativos",
    "sourceUrl": "https://app.notion.com/p/40fa68f2ee6e810eb499f413c4a86dc6",
    "assetsUrl": "https://drive.google.com/drive/folders/1HR4NStra9jaSneKaUByp8tZc-laGA1pL",
    "slideUrls": [
      "https://drive.google.com/file/d/1buv9slkByjaxQsB1UBgdHOr-b-9rWT4H/view",
      "https://drive.google.com/file/d/1I6XbUn3NE3WwOrVIZ3qBg7JEG4lGke5T/view",
      "https://drive.google.com/file/d/1VjJ7UO7NR0Cm3mR4c2VKa00bqINdkDR3/view",
      "https://drive.google.com/file/d/1HILC9am6msuzLgRK10Lb8G_p4jevyO8j/view",
      "https://drive.google.com/file/d/10ov4hqWi98oel_5kdAE0yFAS-TOfimSt/view",
      "https://drive.google.com/file/d/17AiCwW9uJBvblo0e4FaFMy3zreB_237V/view",
      "https://drive.google.com/file/d/1VG5p2KXeVdPrpyg4qpdoUqvf3Hnb9DcS/view",
      "https://drive.google.com/file/d/1gxIxdY-RpdJB8Mssq_T3MXZFA1IaW6DK/view",
      "https://drive.google.com/file/d/1b17cJ-EItR_WHObN95fC5cKX_YXDSLNf/view"
    ],
    "slideCount": 9,
    "reviewNote": "9 PNG, 8 fotografías y CTA. Enlace público/entrega por correo pendientes de validación: NO programar."
  }
];

export const originalCarousels = (): SourcedCarouselPin[] => originals.map(e => ({
  ...e,
  image: "",
  scheduledAt: null,
  status: "draft",
  exported: false,
}));

export const mergeOriginalCarousels = (existing: PinterestPin[]) => {
  const ids = new Set(existing.map(pin => pin.id));
  const addedPins = originalCarousels().filter(pin => !ids.has(pin.id));
  return { added: addedPins.length, pins: [...existing, ...addedPins] };
};
