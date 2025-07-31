// lib/scraper.ts

import { ScrapedPoem } from '@/types/poem'

// Import the poems collection
const poemsCollection = [
    {
        "title": "Giralda, madre de artistas",
        "author": "Fernando Villalón",
        "excerpt": "Giralda, madre de artistas, molde de fundir toreros, dile al giraldillo tuyo que se vista un traje negro. Malhaya sea Perdigón, el torillo traicionero. Negras gualdrapas llevaban los ocho caballos negros: negros son sus atalajes y negros son sus plumeros. De negro los mayorales..."
      },
      {
        "title": "Poema después de una fiesta",
        "author": "Clara Fernández Moreno",
        "excerpt": "Hoy día como aquel que volamos la selva bajo del alba llegando justo al parto del sentimiento abierto días en que no se puede no verte en que quiero salir desde los álamos y echarme montaña abajo para no sentir que quiebro Hay días que se parten en la lanza de tu voz..."
      },
      {
        "title": "Ocurre",
        "author": "Manuel Orestes Nieto",
        "excerpt": "Ocurre que estamos construyendo un monumento a la desmantelación y nada podrá impedir que el ruido de los demolidos caserones se escuche del otro lado del mundo y que el trazo de la ruta de los barcos y la estela marina de las motonaves señalen el sitio exacto donde no será posible olvidar."
      },
      {
        "title": "Era un espejo antiguo...",
        "author": "William Johnston",
        "excerpt": "Era un espejo antiguo donde una niña se rió por verse doble, una dama se retocó el sombrero antes de salir, una mujer leyó ante él la carta de la desaparición de su marido, muerto en la guerra de Crimea, en cumplimiento del deber. Era un espejo antiguo donde una vieja dama se abanica..."
      },
      {
        "title": "De los álamos y los sauces (14)",
        "author": "Rafael Alberti",
        "excerpt": "Perdidos, ¡ay, perdidos! los niños de la luz por las rotas ciudades donde las albas lentas tienen sabor a muerto y los perros sin amo ladran a las ruinas; cuando los ateridos hombres locos maldicen en las oscuridades, se vuelcan los caballos sobre el vientre desierto y solamente fulgen..."
      },
      {
        "title": "El justo",
        "author": "Manuel José Cortes",
        "excerpt": "Al borde del abismo, el roble erguido, del huracán resiste al recio embate, y su lozana copa no se abate ni aun al golpe del rayo que lo ha herido. Así, la condición que le ha cabido sufre el justo, en su vida de combate: exento de temor su pecho late, y el dolor no le arranca ni un gemido. El odio..."
      },
      {
        "title": "Pabellones (1)",
        "author": "Rolando Sánchez Mejías",
        "excerpt": "La enfermera se pasea como un pájaro devastado. Es pequeña, voraz y su labio superior, en un esfuerzo esquizoconvexo y final, se ha constituido en pico sucio. Por otra parte (muestra el médico con paciencia): esos ojitos de rata. Tampoco el Director (de formación brechtiana)..."
      },
      {
        "title": "Uno se queda solo...",
        "author": "Juan Carlos Suñén",
        "excerpt": "Uno se queda solo sin entrar en detalles. Uno se queda a medias en su vaso de vino, a medias en su pan. Y cómo puede no volverse su embozo tan pesado, tan gastado en el hombre, que alguien sepa poner allí más verbo que este que da comienzo a la altura del pomo..."
      },
      {
        "title": "Ay muerte más florida",
        "author": "Manuel Ponce",
        "excerpt": "¡Ay muerte más florida! Nos ha traído una lengua lejana a este puro silencio de bosque partido, en el canto de ayer que se delata en nido, en el silente nido que cantará mañana. Callamos por la luz que se rebana, por la hoja que se ha distraído y cae. Yo estoy herido de muerte..."
      },
      {
        "title": "No has sentido en la noche...",
        "author": "Gustavo Adolfo Bécquer",
        "excerpt": "¿No has sentido en la noche, cuando reina la sombra una voz apagada que canta y una inmensa tristeza que llora? ¿No sentiste en tu oído de virgen las silentes y trágicas notas que mis dedos de muerto arrancaban a la lira rota? ¿No sentiste una lágrima mía deslizarse en tu boca..."
      },
      {
        "title": "Lupe",
        "author": "Regis Iglesias Ramírez",
        "excerpt": "Fiebre...La Lupe en la penumbra descalza camina. Ya no la persigue la blanca luz de luna china (en lo alto, al final de un oscuro cabaret), el rostro recién barnizado... Fiebre... derrama el licor, salta su collar de perlas; ha perdido un pendiente en la caja sonora de macillos y cuerdas metálicas."
      },
      {
        "title": "Globalización",
        "author": "Néstor Martínez",
        "excerpt": "Allá lejos de tu patria decidieron la muerte de tu raza no vieron tus lágrimas de impotencia centenaria ni tu bolsillo vacío de aspiraciones perdidas ni la desesperanza frente a la muerte de los niños hambrientos ni oyeron tus ruegos de paz y justicia ni el protestar de tu estómago..."
      },
      {
        "title": "Hay que caer y no se puede elegir dónde...",
        "author": "Roberto Juarroz",
        "excerpt": "Hay que caer y no se puede elegir dónde. Pero hay cierta forma del viento en los cabellos, cierta pausa del golpe, cierta esquina del brazo que podemos torcer mientras caemos. Es tan sólo el extremo de un signo, la punta sin pensar de un pensamiento. Pero basta..."
      },
      {
        "title": "Quién fuera luna...",
        "author": "Gustavo Adolfo Bécquer",
        "excerpt": "Quién fuera luna, quién fuera brisa, quién fuera sol! ¡Quién del crepúsculo fuera la hora, quién el instante de tu oración! ¡Quién fuera parte de la plegaria que solitaria mandas a Dios! ¡Quién fuera luna quién..."
      },
      {
        "title": "Asalto al sol 1",
        "author": "Heddy Navarro Harris",
        "excerpt": "Parada sobre la piedra que aún no puede asir mi planta soporto la tempestad de tus ojos he de caer o miraré para siempre la profundidad de tus aguas"
      },
      {
        "title": "Mariposas",
        "author": "Manuel Gutiérrez Nájera",
        "excerpt": "Ora blancas cual copos de nieve, ora negras, azules o rojas, en miríadas esmaltan el aire y en los pétalos frescos retozan. Leves saltan del cáliz abierto, como prófugas almas de rosas y con gracia gentil se columpian en sus verdes hamacas de hojas. Una chispa de luz les da vida y una gota..."
      },
      {
        "title": "De la vigilia estéril",
        "author": "Rosario Castellanos",
        "excerpt": "No voy a repetir las antiguas palabras de la desolación y la amargura ni a derretir mi pecho en el pomo del llanto. El pudor es la cima más alta de la angustia y el silencio la estrella más fúlgida en la noche. Diré una vez, sin lágrimas, como si fuera ajeno el tema exasperado de mi sangre."
      },
      {
        "title": "El parque dormido",
        "author": "José Domingo Gómez Rojas",
        "excerpt": "Sendas que se bifurcan todas blancas de luna; árboles que proyectan sus formas recostadas; escaños solitarios; fuentes cuyas cascadas remedan una orquesta. Sobre la gran laguna la brisa orla su peplo. Pilastras con jarrones donde el fauno sonríe con sus belfos lascivos mientras la ninfa..."
      },
      {
        "title": "Candor",
        "author": "Julio Flórez",
        "excerpt": "Azul... azul... azul estaba el cielo. El hálito quemante del estío comenzaba a dorar el terciopelo del prado, en donde se remansa el río. A lo lejos, el humo de un bohío, tal de una novia el intocado velo, se alza hasta perderse en el vacío con un ondulante y silencioso..."
      },
      {
        "title": "Y sobre aquella especie de amuleto plateado...",
        "author": "Inmaculada Mengíbar",
        "excerpt": "Y sobre aquella especie de amuleto plateado prendido en su chaqueta, que me hizo esconder era un regalo de ella a media noche, no escribir un poema. Mujeres de carne y verso. Antología poética femenina en lengua española del siglo XX."
      },
      {
        "title": "En la víspera de cualquier acontecimiento importante...",
        "author": "Jacqueline Goldberg",
        "excerpt": "en la víspera de cualquier acontecimiento importante salvo la furia y mis desiertos defiendo a dentelladas el permiso de escapar por si me aburre la falta el periplo enmendado con que muchos pronuncian sus recovecos insisto en mis aplausos la tardanza que recoge migas síntomas..."
      },
      {
        "title": "Mucho, señora, daría...",
        "author": "José Martí",
        "excerpt": "Mucho, señora, daría Por tender sobre tu espalda Tu cabellera bravía, Tu cabellera de gualda: Despacio la tendería, Callado la besaría. Por sobre la oreja fina Baja lustroso el cabello, Lo mismo que una cortina Que se levanta hacia el cuello. La oreja es obra divina De porcelana..."
      },
      {
        "title": "Los rostros del olvido",
        "author": "Gonzalo Osses – Vilches",
        "excerpt": "Ahora espero acorralar las pocas palabras que me agradan para abrirlas por el medio y descubrir su fondo. Dos de ellas se escondieron en mi viejo diccionario las demás huyeron... pero tengo un libro que las contiene y las pronunciaré hasta quedar dormido. Una vez allí, las repetirá..."
      },
      {
        "title": "Como pájaros perdidos (Poema XXXVI)",
        "author": "Jaime Sabines",
        "excerpt": "La policía irrumpió en la casa y atrapó a los participantes de aquella fiesta. Se los llevó a la cárcel por lujuriosos y perversos. Era natural. La policía no puede irrumpir en las calles y acabar..."
      }
] as ScrapedPoem[]

/**
 * Get poems from the curated collection
 */
export async function scrapePoems(): Promise<ScrapedPoem[]> {
  console.log('📚 Loading poems from curated collection...')
  
  try {
    // Shuffle the poems array to return random selection
    const shuffledPoems = [...poemsCollection].sort(() => Math.random() - 0.5)
    
    console.log(`✨ Successfully loaded ${shuffledPoems.length} Spanish poems`)
    
    return shuffledPoems
    
  } catch (error) {
    console.error('❌ Error loading poem collection:', error)
    throw new Error('Failed to load poem collection')
  }
}

/**
 * Test scraper function
 */
export async function testScraper(): Promise<{ success: boolean; poemsFound: number; samplePoem?: ScrapedPoem; error?: string }> {
  try {
    const poems = await scrapePoems()
    
    return {
      success: poems.length > 0,
      poemsFound: poems.length,
      samplePoem: poems[0] || undefined
    }
    
  } catch (error) {
    return {
      success: false,
      poemsFound: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}