// ===== CONFIGURAÇÃO: edite aqui =====
const WA = "5514999999999"; // ← altere o número do WhatsApp aqui (DDI+DDD+número)
const SERV = ["EDITORIAL", "PORTRAIT", "WEDDING", "COUPLE", "EVENT", "BRAND"];
const PROJ = [
    ["WEDDING", "2025", "Lins"],
    ["EDITORIAL", "2024", "São Paulo"],
    ["PORTRAIT", "2024", "Bauru"],
    ["BRAND", "2023", "Campinas"]
];
const REV = [
    ["Cada foto parece um frame de cinema. Choramos ao ver o álbum.", "Marina & Lucas", "Wedding"],
    ["Direção sensível e olhar único. Nossa marca ganhou outra presença.", "Atelier Norte", "Brand"],
    ["Me senti confortável do início ao fim. Resultado impecável.", "Beatriz S.", "Portrait"]
];
const PAL = [
    ["#2b1d16", "#d9a066"],
    ["#101a24", "#6f9bb8"],
    ["#241a2a", "#c98aa0"],
    ["#1b2018", "#a8b878"],
    ["#2a2320", "#e8dcc4"],
    ["#14141c", "#8f8fd0"]
];

// Fotos (troque por arquivos locais, ex.: 'images/foto-1.jpg', 7 imagens verticais ~800x1000)
const IMAGES = [1011, 1027, 1005, 1074, 1043, 1016, 1025].map(id => `https://picsum.photos/id/${id}/800/1000`);