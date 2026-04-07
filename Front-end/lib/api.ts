// Aquí debería ir la lógica de las llamadas a la API, pero como no tenemos una API real, esta parte se ha dejado con datos dummy

// data/products.ts

import { Product, Category, SkinType, ProductType } from "@/types/product";
import { User } from "@/types/user";
import { toLowerCaseAndReplaceHyphensWithSpaces } from "./string-utils";

const products: Product[] = [
    {
        id: "1",
        name: "Toleriane Double Repair Face Moisturizer",
        brand: "La Roche-Posay",
        skin_type: [SkinType.NORMAL, SkinType.SECA, SkinType.SENSIBLE],
        product_type: ProductType.CREAM,
        category: [Category.HIDRATACION],
        ingredients: ["ceramida-3", "niacinamida", "glicerina", "agua termal"],
        image_url: ["https://images-na.ssl-images-amazon.com/images/I/41oMKHKCJCL._UL500_.jpg"],
        description: "Crema hidratante ligera que fortalece la barrera cutánea y proporciona hidratación hasta por 48 horas. Formulada con ceramida-3, niacinamida y agua termal para calmar y proteger la piel sensible.",
        rating: 4.7,
        review_count: 12453
    },
    {
        id: "2",
        name: "SA Smoothing Cleanser",
        brand: "CeraVe",
        skin_type: [SkinType.GRASA, SkinType.MIXTA, SkinType.TEXTURIZADA],
        product_type: ProductType.EXFOLIANT,
        category: [Category.LIMPIEZA],
        ingredients: ["ácido salicílico", "ceramidas", "niacinamida", "ácido hialurónico"],
        image_url: ["https://www.lookfantastic.es/images?url=https://static.thcdn.com/productimg/original/12207663-1995074481347395.jpg&format=webp&auto=avif&width=1200&height=1200&fit=cover"],
        description: "Limpiador exfoliante con ácido salicílico que ayuda a suavizar la textura de la piel y destapar poros sin comprometer la barrera cutánea. Ideal para piel grasa, mixta o con textura irregular.",
        rating: 4.6,
        review_count: 9821
    },
    {
        id: "3",
        name: "Glycolic Acid 7% Toning Solution",
        brand: "The Ordinary",
        skin_type: [SkinType.NORMAL, SkinType.MIXTA, SkinType.GRASA],
        product_type: ProductType.EXFOLIANT,
        category: [Category.EXFOLIACION],
        ingredients: ["ácido glicólico", "aloe vera", "ginseng", "tasmanian pepperberry"],
        image_url: ["https://bebeautycol.com/cdn/shop/products/2FD69212-7EA4-4947-9824-9199F91146AE_1200x1200.jpg?v=1704781572"],
        description: "Tónico exfoliante con 7% de ácido glicólico que mejora la luminosidad y textura de la piel. Ayuda a reducir manchas y líneas finas con uso constante.",
        rating: 4.5,
        review_count: 15890
    },
    {
        id: "4",
        name: "Advanced Génifique Serum",
        brand: "Lancôme",
        skin_type: [SkinType.NORMAL, SkinType.SECA, SkinType.GRASA, SkinType.MIXTA],
        product_type: ProductType.SERUM,
        category: [Category.ANTI_EDAD],
        ingredients: ["ácido hialurónico", "bifidus extract", "vitamina C", "glicerina"],
        image_url: ["https://static.sweetcare.com/img/prd/488/v-638200523158559322/lancome-003003lc-4.webp"],
        description: "Suero antiedad avanzado que mejora visiblemente la luminosidad y firmeza de la piel. Contiene ácido hialurónico y extracto de bifidus para reforzar la barrera cutánea.",
        rating: 4.8,
        review_count: 7342
    },
    {
        id: "5",
        name: "Hydro Boost Water Gel",
        brand: "Neutrogena",
        skin_type: [SkinType.NORMAL, SkinType.MIXTA, SkinType.GRASA],
        product_type: ProductType.GEL,
        category: [Category.HIDRATACION],
        ingredients: ["ácido hialurónico", "glicerina", "dimeticona", "olivato de sorbitán"],
        image_url: ["https://habibdroguerias.vtexassets.com/arquivos/ids/157438-800-auto?v=638459643757500000&width=800&height=auto&aspect=true"],
        description: "Gel hidratante ligero con ácido hialurónico que aporta hidratación intensa sin sensación grasa. Perfecto para piel normal a grasa.",
        rating: 4.6,
        review_count: 21456
    },
    {
        id: "6",
        name: "Cicaplast Baume B5",
        brand: "La Roche-Posay",
        skin_type: [SkinType.SENSIBLE, SkinType.IRRITADA, SkinType.SECA],
        product_type: ProductType.BALM,
        category: [Category.REPARACION],
        ingredients: ["pantenol", "madecassoside", "manteca de karité", "zinc"],
        image_url: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8OStExzMvoqxBSu1C-SznSXOSHd3jPd_l0Q&s"],
        description: "Bálsamo reparador multiuso que calma, protege y repara la piel irritada o sensibilizada. Enriquecido con pantenol y madecassoside.",
        rating: 4.9,
        review_count: 18765
    },
    {
        id: "7",
        name: "Green Tea Seed Serum",
        brand: "Innisfree",
        skin_type: [SkinType.NORMAL, SkinType.SECA, SkinType.MIXTA],
        product_type: ProductType.SERUM,
        category: [Category.HIDRATACION],
        ingredients: ["extracto de té verde", "niacinamida", "betaína", "glicerina"],
        image_url: ["https://i0.wp.com/rosavainilla.co/wp-content/uploads/2020/08/gtss_new.webp?fit=800%2C800&ssl=1", "https://koreanskincare.com/cdn/shop/files/467013853_18466105798037010_9177982332670859662_n.jpg?v=1738151086", "https://nudieglow.com/cdn/shop/files/INNISFREE-Green-Tea-Seed-Hyaluronic-Serum-NEW-Nudie-Glow-Australia_1000x.jpg?v=1698228961", "https://www.koreanbeauty.es/cdn/shop/files/innisfree-Green-Tea-Seed-Hyaluronic-Serum-80ml-1.png?v=1743600651&width=1080", "https://www.beautymonster.store/cdn/shop/files/InnisfreeGreenTeaSeedSerum80ml_1.png?v=1694588390&width=1200", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJJm5zqr4UzHKABU-OZX91eIn5iizJ33ubiQ&s"],
        description: "Suero hidratante con extracto de té verde que revitaliza y equilibra la piel, proporcionando hidratación profunda y efecto calmante.",
        rating: 4.5,
        review_count: 6432
    },
    {
        id: "8",
        name: "Vitamin C Suspension 23% + HA Spheres 2%",
        brand: "The Ordinary",
        skin_type: [SkinType.NORMAL, SkinType.MIXTA, SkinType.OPACA],
        product_type: ProductType.SERUM,
        category: [Category.ANTIOXIDANTE],
        ingredients: ["ácido ascórbico", "ácido hialurónico", "escualano", "tocoferol"],
        image_url: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjWwYICcN2Ltwv4ucjZbmwUY81SuYRcrHLKg&s"],
        description: "Suero antioxidante con 23% de vitamina C pura que mejora la luminosidad y combate los signos del envejecimiento. Contiene ácido hialurónico para mantener la hidratación.",
        rating: 4.4,
        review_count: 11234
    },
    {
        id: "9",
        name: "Retinol 0.3% in Squalane",
        brand: "The Ordinary",
        skin_type: [SkinType.NORMAL, SkinType.MIXTA, SkinType.GRASA],
        product_type: ProductType.SERUM,
        category: [Category.ANTI_EDAD],
        ingredients: ["retinol", "escualano", "jojoba oil", "tomato extract"],
        image_url: ["https://cosmetis.com/media/catalog/product/c/t/ct204001-theordinary_retinol_2_squalene_serum_30ml.jpg"],
        description: "Suero con retinol al 0.3% que ayuda a reducir líneas finas, mejorar textura y unificar el tono. Ideal para introducir el retinol progresivamente.",
        rating: 4.6,
        review_count: 16789
    },
    {
        id: "10",
        name: "Ultra Facial Cream",
        brand: "Kiehl's",
        skin_type: [SkinType.NORMAL, SkinType.SECA, SkinType.MIXTA, SkinType.GRASA, SkinType.SENSIBLE],
        product_type: ProductType.CREAM,
        category: [Category.HIDRATACION],
        ingredients: ["escualano", "glicerina", "glacial glycoprotein", "urea"],
        image_url: ["https://http2.mlstatic.com/D_NQ_NP_704291-MLU54983799272_042023-O.webp"],
        description: "Crema hidratante facial de uso diario que proporciona hidratación prolongada y fortalece la barrera de la piel en todo tipo de piel.",
        rating: 4.8,
        review_count: 9543
    },
    {
        id: "11",
        name: "Effaclar Gel Limpiador Purificante",
        brand: "La Roche-Posay",
        skin_type: [SkinType.GRASA, SkinType.MIXTA, SkinType.ACNEICA],
        product_type: ProductType.CLEANSER,
        category: [Category.LIMPIEZA],
        ingredients: ["agua termal", "zinc PCA", "coco-betaína", "glicerina"],
        image_url: ["https://pielfarmaceutica.com/cdn/shop/files/effaclar_gel_x_400ml.png?v=1723645399"],
        description: "Gel limpiador purificante que elimina el exceso de grasa y limpia profundamente los poros sin resecar la piel.",
        rating: 4.7,
        review_count: 13221
    },
    {
        id: "12",
        name: "Hydrating Facial Cleanser",
        brand: "CeraVe",
        skin_type: [SkinType.NORMAL, SkinType.SECA, SkinType.SENSIBLE],
        product_type: ProductType.CLEANSER,
        category: [Category.LIMPIEZA],
        ingredients: ["ceramidas", "ácido hialurónico", "glicerina", "colesterol"],
        image_url: ["https://cocorosey.net/cdn/shop/products/16_1800x.jpg?v=1653346366"],
        description: "Limpiador facial suave que elimina impurezas mientras mantiene la hidratación natural de la piel gracias a sus ceramidas y ácido hialurónico.",
        rating: 4.8,
        review_count: 20567
    },
    {
        id: "13",
        name: "Niacinamide 10% + Zinc 1%",
        brand: "The Ordinary",
        skin_type: [SkinType.GRASA, SkinType.MIXTA, SkinType.ACNEICA],
        product_type: ProductType.SERUM,
        category: [Category.ANTIOXIDANTE],
        ingredients: ["niacinamida", "zinc PCA", "tamarindus indica seed gum", "pentylene glycol"],
        image_url: ["https://bebeautycol.com/cdn/shop/products/image_33008b22-795b-41a9-bc5f-cbcc31a1f602_1024x1024.jpg?v=1704781533"],
        description: "Serum con niacinamida y zinc que ayuda a regular el exceso de sebo, reducir imperfecciones y mejorar la apariencia de los poros.",
        rating: 4.5,
        review_count: 18934
    },
    {
        id: "14",
        name: "Advanced Snail 96 Mucin Power Essence",
        brand: "COSRX",
        skin_type: [SkinType.NORMAL, SkinType.SECA, SkinType.MIXTA],
        product_type: ProductType.ESSENCE,
        category: [Category.REPARACION],
        ingredients: ["mucina de caracol", "betaína", "butylene glycol", "arginina"],
        image_url: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6AiLsjODpxkoXlXoXDN6bDwNvAD4B_zV8Mw&s"],
        description: "Esencia reparadora con 96% de mucina de caracol que mejora la elasticidad, hidrata profundamente y ayuda a reparar la piel dañada.",
        rating: 4.7,
        review_count: 8765
    },
    {
        id: "15",
        name: "Mineral 89",
        brand: "Vichy",
        skin_type: [SkinType.NORMAL, SkinType.SECA, SkinType.MIXTA, SkinType.GRASA, SkinType.SENSIBLE],
        product_type: ProductType.SERUM,
        category: [Category.HIDRATACION],
        ingredients: ["agua volcánica de Vichy", "ácido hialurónico", "glicerina", "carbómero"],
        image_url: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiQUy4b0kJxqUJApxBbU1EtEaOyt8HgnI-Qw&s"],
        description: "Suero hidratante con agua volcánica y ácido hialurónico que fortalece la barrera cutánea y protege contra agresores externos.",
        rating: 4.9,
        review_count: 14234
    }
];

export function getProducts(): Product[] {
    return products;
}

export function getProductById(id: string): Product | undefined {
    return products.find(product => product.id === id);
}

export function getProductByName(name: string): Product | undefined {
    return products.find(product => toLowerCaseAndReplaceHyphensWithSpaces(product.name) === toLowerCaseAndReplaceHyphensWithSpaces(name));
}

export function getProductsByCategory(category: Category | "ALL"): Product[] {
    if (category === "ALL") {
        return products;
    }
    return products.filter(product => product.category.includes(category));
}

const users: User[] = [
    {
        id: "u1",
        name: "Sofía Navarro",
        avatarUrl: "https://i.pravatar.cc/80?img=29",
        email: "sofia@skin4all.com",
        login: "sofian",
        password: "skin4all123",
        city: "Madrid, Spain",
        skinType: "Combination / Sensitive",
        bio: "Focused on keeping my barrier healthy with lightweight hydration and gentle actives.",
        reviewCount: 18,
        favoriteProductIds: ["1", "5", "12", "14"],
        createdRoutineIds: ["r1", "r7"]
    },
    {
        id: "u2",
        name: "Alex Romero",
        avatarUrl: "https://i.pravatar.cc/80?img=22",
        email: "alex@skin4all.com",
        login: "alexr",
        password: "skin4all123",
        city: "Barcelona, Spain",
        skinType: "Dry / Dehydrated",
        bio: "Night routine fan, always looking for rich textures and effective anti-aging products.",
        reviewCount: 12,
        favoriteProductIds: ["1", "4", "10", "15"],
        createdRoutineIds: ["r2", "r9"]
    },
    {
        id: "u3",
        name: "Jamie López",
        avatarUrl: "https://i.pravatar.cc/80?img=36",
        email: "jamie@skin4all.com",
        login: "jamiel",
        password: "skin4all123",
        city: "Ciudad de México, Mexico",
        skinType: "Textured / Resilient",
        bio: "I keep things simple: exfoliate strategically, hydrate deeply, repeat consistently.",
        reviewCount: 9,
        favoriteProductIds: ["3", "6", "11", "14"],
        createdRoutineIds: ["r6"]
    },
    {
        id: "u4",
        name: "Marcos Díaz",
        avatarUrl: "https://i.pravatar.cc/80?img=14",
        email: "marcos@skin4all.com",
        login: "markd",
        password: "skin4all123",
        city: "Buenos Aires, Argentina",
        skinType: "Oily / Acne-prone",
        bio: "Sharing routines that balance oil control with a healthy, calm skin barrier.",
        reviewCount: 15,
        favoriteProductIds: ["2", "5", "11", "13"],
        createdRoutineIds: ["r3", "r8"]
    },
    {
        id: "u5",
        name: "Chloe Vargas",
        avatarUrl: "https://i.pravatar.cc/80?img=41",
        email: "chloe@skin4all.com",
        login: "chloev",
        password: "skin4all123",
        city: "Lima, Peru",
        skinType: "Sensitive / Dry",
        bio: "If a product helps calm redness and lock in moisture, it probably ends up in my shelfie.",
        reviewCount: 11,
        favoriteProductIds: ["1", "6", "10", "14"],
        createdRoutineIds: ["r4", "r10"]
    },
    {
        id: "u6",
        name: "Nina Paredes",
        avatarUrl: "https://i.pravatar.cc/80?img=44",
        email: "nina@skin4all.com",
        login: "ninap",
        password: "skin4all123",
        city: "Bogotá, Colombia",
        skinType: "Dull / Combination",
        bio: "I love antioxidant-heavy morning routines that brighten without overloading the skin.",
        reviewCount: 14,
        favoriteProductIds: ["2", "8", "12", "15"],
        createdRoutineIds: ["r5"]
    }
];

export function getUsers(): User[] {
    return users;
}

export function getUserById(id: string): User | undefined {
    return users.find((user) => user.id === id);
}

export function authenticateUser(identifier: string, password: string): User | null {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const user = users.find((candidate) => {
        const matchesIdentifier =
            candidate.email.toLowerCase() === normalizedIdentifier ||
            candidate.login.toLowerCase() === normalizedIdentifier;

        return matchesIdentifier && candidate.password === normalizedPassword;
    });

    return user ?? null;
}