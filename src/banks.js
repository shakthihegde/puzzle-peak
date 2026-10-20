'use strict';
// Original verbal items written in the formats used by CogAT/CCAT (verbal battery),
// OLSAT (verbal reasoning / logical selection) and ISEE/SSAT (synonyms, sentence completion).
// Format per line:  stem => ANSWER | distractor, distractor, ... | explanation | level(1-3)
PP.BANK = {};

PP.BANK.analogies = `
puppy : dog :: kitten : => cat | kitty, mouse, lion, pet | A puppy is a baby dog, and a kitten is a baby cat. | 1
bird : nest :: bee : => hive | honey, flower, sting, wasp | A bird lives in a nest; a bee lives in a hive. | 1
glove : hand :: sock : => foot | shoe, leg, boot, wool | A glove covers a hand; a sock covers a foot. | 1
hot : cold :: up : => down | high, over, top, sky | Hot is the opposite of cold; up is the opposite of down. | 1
pen : write :: knife : => cut | fork, sharp, kitchen, spoon | You write with a pen; you cut with a knife. | 1
fish : swim :: bird : => fly | feather, nest, wing, sing | Fish move by swimming; birds move by flying. | 1
day : night :: summer : => winter | sun, spring, hot, holiday | Day and night are opposites, and so are summer and winter. | 1
page : book :: brick : => wall | house, clay, heavy, red | Many pages make a book; many bricks make a wall. | 1
eye : see :: ear : => hear | sound, nose, music, head | We see with our eyes and hear with our ears. | 1
cow : milk :: hen : => egg | farm, chick, feather, corn | A cow gives us milk; a hen gives us eggs. | 1
car : road :: boat : => water | sail, fish, beach, captain | A car travels on a road; a boat travels on water. | 1
doctor : hospital :: teacher : => school | student, book, lesson, desk | A doctor works in a hospital; a teacher works in a school. | 1
leaf : tree :: petal : => flower | stem, garden, seed, pretty | A leaf is part of a tree; a petal is part of a flower. | 1
foot : shoe :: head : => hat | hair, face, neck, brain | A shoe goes on a foot; a hat goes on a head. | 1
broom : sweep :: shovel : => dig | dirt, garden, rake, bucket | A broom is used to sweep; a shovel is used to dig. | 1
three : triangle :: four : => square | circle, five, corner, line | A triangle has three sides; a square has four sides. | 1
lamb : sheep :: calf : => cow | horse, milk, farm, goat | A lamb is a baby sheep; a calf is a baby cow. | 1
wet : dry :: open : => closed | door, window, wide, key | Wet and dry are opposites, and so are open and closed. | 1
spider : web :: bird : => nest | egg, fly, tree, feather | A spider builds a web to live in; a bird builds a nest. | 1
cold : sweater :: rain : => umbrella | cloud, wet, puddle, storm | You use a sweater for the cold and an umbrella for the rain. | 1
nose : smell :: tongue : => taste | mouth, lick, teeth, food | We smell with our nose and taste with our tongue. | 1
north : south :: east : => west | compass, map, sun, left | North is opposite south; east is opposite west. | 1
fins : fish :: wings : => bird | feathers, fly, sky, nest | Fish use fins to move; birds use wings to move. | 1
oak : tree :: rose : => flower | thorn, red, garden, petal | An oak is a kind of tree; a rose is a kind of flower. | 1
bark : dog :: moo : => cow | horse, grass, farm, milk | A dog barks; a cow moos. | 1
stove : kitchen :: bed : => bedroom | pillow, sleep, house, blanket | A stove is found in a kitchen; a bed is found in a bedroom. | 1
yesterday : today :: today : => tomorrow | now, week, morning, calendar | Today comes after yesterday; tomorrow comes after today. | 1
king : queen :: prince : => princess | castle, crown, royal, knight | A king and queen are a pair, and so are a prince and princess. | 1
hungry : eat :: tired : => sleep | yawn, bed, night, run | When you are hungry you eat; when you are tired you sleep. | 1
paint : brush :: write : => pencil | paper, letter, read, eraser | You paint with a brush and write with a pencil. | 1
author : book :: composer : => music | piano, concert, orchestra, singer | An author creates a book; a composer creates music. | 2
chef : kitchen :: scientist : => laboratory | microscope, experiment, test, doctor | A chef works in a kitchen; a scientist works in a laboratory. | 2
clock : time :: scale : => weight | heavy, kitchen, fish, number | A clock measures time; a scale measures weight. | 2
seed : plant :: egg : => bird | nest, shell, yolk, hatch | A seed grows into a plant; an egg hatches into a bird. | 2
wolf : pack :: fish : => school | water, fin, pond, net | A group of wolves is a pack; a group of fish is a school. | 2
cow : herd :: bee : => swarm | hive, honey, buzz, queen | A big group of cows is a herd; a big group of bees is a swarm. (A hive is where bees live.) | 2
whisper : shout :: walk : => run | talk, step, legs, stroll | Shouting is a much stronger whisper; running is a much faster walk. | 2
hammer : nail :: screwdriver : => screw | wood, tool, drill, hammer | A hammer drives in a nail; a screwdriver turns a screw. | 2
caterpillar : butterfly :: tadpole : => frog | fish, pond, lily, egg | A caterpillar grows into a butterfly; a tadpole grows into a frog. | 2
mile : distance :: hour : => time | clock, minute, long, day | A mile measures distance; an hour measures time. | 2
library : books :: aquarium : => fish | water, glass, tank, zoo | A library holds a collection of books; an aquarium holds a collection of fish. | 2
water : thirst :: food : => hunger | eat, plate, cook, meal | Water takes away thirst; food takes away hunger. | 2
pupil : eye :: palm : => hand | tree, finger, wrist, glove | The pupil is part of the eye; the palm is part of the hand. | 2
cub : bear :: foal : => horse | cow, saddle, barn, goat | A cub is a baby bear; a foal is a baby horse. | 2
painter : brush :: carpenter : => saw | wood, house, chair, paint | A painter works with a brush; a carpenter works with a saw. | 2
second : minute :: minute : => hour | clock, time, day, watch | 60 seconds make a minute; 60 minutes make an hour. | 2
fast : slow :: generous : => selfish | kind, rich, giving, fair | Fast is the opposite of slow; generous is the opposite of selfish. | 2
bread : bakery :: medicine : => pharmacy | doctor, pill, sick, nurse | You buy bread at a bakery and medicine at a pharmacy. | 2
vet : animals :: doctor : => people | hospital, sick, medicine, nurse | A vet takes care of animals; a doctor takes care of people. | 2
earth : planet :: sun : => star | moon, hot, sky, light | Earth is a planet; the Sun is a star. | 2
violin : bow :: drum : => stick | loud, music, band, piano | You play a violin with a bow and a drum with a stick. | 2
freeze : ice :: boil : => steam | water, hot, kettle, bubble | Water that freezes becomes ice; water that boils becomes steam. | 2
cotton : shirt :: wool : => sweater | sheep, warm, knit, soft | A shirt can be made of cotton; a sweater can be made of wool. | 2
word : sentence :: sentence : => paragraph | letter, book, period, story | Words make up a sentence; sentences make up a paragraph. | 2
predator : prey :: cat : => mouse | dog, whiskers, pet, cheese | A predator hunts prey, the way a cat hunts a mouse. | 2
hive : bees :: kennel : => dog | bark, bone, cat, leash | Bees live in a hive; a dog lives in a kennel. | 2
ruler : length :: thermometer : => temperature | hot, doctor, fever, glass | A ruler measures length; a thermometer measures temperature. | 2
octagon : eight :: hexagon : => six | five, shape, sides, bee | An octagon has eight sides; a hexagon has six. | 2
wheel : bicycle :: wing : => airplane | pilot, sky, fly, airport | A wheel is part of a bicycle; a wing is part of an airplane. | 2
needle : sew :: oven : => bake | kitchen, pan, hot, cake | You sew with a needle and bake with an oven. | 2
flock : sheep :: bouquet : => flowers | vase, garden, petal, wedding | A flock is a group of sheep; a bouquet is a group of flowers. | 2
dime : ten :: quarter : => twenty-five | coin, four, money, nickel | A dime is worth ten cents; a quarter is worth twenty-five cents. | 2
artist : paint :: author : => write | read, book, pen, story | An artist paints; an author writes. | 2
inch : foot :: centimetre : => metre | ruler, long, gram, millimetre | Inches make up a foot; centimetres make up a metre. | 2
astronaut : space :: diver : => ocean | rocket, fish, mask, boat | An astronaut explores space; a diver explores the ocean. | 2
lake : pond :: mountain : => hill | valley, river, rock, climb | A pond is a small lake; a hill is a small mountain. | 2
author : novel :: sculptor : => statue | clay, chisel, museum, artist | An author makes a novel; a sculptor makes a statue. | 3
timid : bold :: ancient : => modern | old, history, antique, brave | Timid is the opposite of bold; ancient is the opposite of modern. | 3
famine : food :: drought : => water | rain, desert, hunger, heat | A famine is a lack of food; a drought is a lack of water. | 3
microscope : tiny :: telescope : => distant | star, lens, big, sky | A microscope helps you see tiny things; a telescope helps you see distant things. | 3
hungry : famished :: tired : => exhausted | rested, bed, yawn, awake | Famished means very hungry; exhausted means very tired. | 3
architect : building :: cartographer : => map | globe, compass, explorer, ship | An architect designs buildings; a cartographer makes maps. | 3
oasis : desert :: island : => ocean | sand, palm, beach, boat | An oasis is a small spot of water in a desert; an island is a small spot of land in an ocean. | 3
calf : cow :: kid : => goat | child, sheep, farm, horn | A calf is a baby cow; a kid is a baby goat. (Careful: “kid” has two meanings!) | 3
fragile : break :: flammable : => burn | fire, glass, wood, smoke | Something fragile breaks easily; something flammable burns easily. | 3
pen : ink :: car : => fuel | road, wheel, engine, drive | A pen uses up ink to work; a car uses up fuel. | 3
scene : play :: chapter : => book | page, author, story, title | A scene is one part of a play; a chapter is one part of a book. | 3
scarce : plentiful :: rare : => common | unusual, gem, few, special | Scarce is the opposite of plentiful; rare is the opposite of common. | 3
glacier : ice :: dune : => sand | desert, water, cold, wind | A glacier is a huge mass of ice; a dune is a big hill of sand. | 3
herbivore : plants :: carnivore : => meat | teeth, lion, hunt, fruit | A herbivore eats plants; a carnivore eats meat. | 3
quiet : silent :: cold : => frozen | hot, warm, snow, winter | Silent is the most quiet something can be; frozen is extremely cold. | 3
mammal : whale :: bird : => penguin | fish, fly, ice, wing | A whale is a mammal; a penguin is a bird. (Not every bird can fly!) | 3
canvas : painter :: marble : => sculptor | stone, statue, chisel, museum | A painter works on canvas; a sculptor works on marble. | 3
grape : raisin :: plum : => prune | peach, juice, purple, dry | A dried grape is a raisin; a dried plum is a prune. | 3
recipe : cook :: map : => travel | road, paper, city, draw | You follow a recipe to cook and a map to travel. | 3
key : lock :: password : => account | keyboard, secret, screen, type | A key opens a lock; a password opens an account. | 3
hour : day :: day : => week | month, minute, night, calendar | 24 hours make a day; 7 days make a week. | 2
cocoon : moth :: egg : => chick | hen, nest, shell, yolk | A moth comes out of a cocoon; a chick comes out of an egg. | 2
river : bridge :: wall : => door | brick, house, ladder, paint | A bridge lets you get across a river; a door lets you get through a wall. | 3
sculptor : chisel :: surgeon : => scalpel | hospital, nurse, patient, bandage | A sculptor cuts with a chisel; a surgeon cuts with a scalpel. | 3
stomach : digest :: lungs : => breathe | air, chest, heart, oxygen | The stomach digests food; the lungs breathe air. | 3
pilot : airplane :: captain : => ship | sea, sailor, harbour, anchor | A pilot steers an airplane; a captain commands a ship. | 2
sprint : run :: devour : => eat | food, hungry, cook, chew | To sprint is to run very fast; to devour is to eat very hungrily. | 3
`;

PP.BANK.classify = `
apple, banana, cherry => grape | carrot, potato, bread, salad | They are all fruits. | 1
piano, guitar, drum => flute | music, song, band, singer | They are all musical instruments. | 1
hammer, saw, wrench => screwdriver | nail, wood, toolbox, build | They are all tools. | 1
circle, square, triangle => rectangle | line, corner, round, draw | They are all flat shapes. | 1
Monday, Friday, Sunday => Tuesday | June, weekend, morning, holiday | They are all days of the week. | 1
January, April, October => March | Monday, winter, birthday, calendar | They are all months. | 1
robin, eagle, sparrow => owl | bat, butterfly, nest, feather | They are all birds. (A bat flies but is a mammal.) | 1
shirt, pants, jacket => sweater | button, closet, needle, wash | They are all clothes you wear. | 1
car, bus, truck => van | road, driver, wheel, garage | They are all vehicles that drive on roads. | 1
milk, juice, water => tea | cup, bread, thirsty, ice | They are all drinks. | 1
rose, tulip, daisy => lily | tree, grass, stem, garden | They are all flowers. | 1
oak, maple, pine => birch | leaf, forest, rose, wood | They are all trees. | 1
lion, tiger, leopard => cheetah | wolf, zebra, jungle, stripe | They are all big wild cats. | 1
summer, fall, winter => spring | season, sunny, snow, holiday | They are all seasons. (“Season” is the group name, not one of them.) | 1
cake, cookie, pie => brownie | salt, fork, oven, carrot | They are all sweet baked desserts. | 1
soccer, hockey, tennis => baseball | ball, team, net, coach | They are all sports. | 1
crayon, marker, pencil => pen | paper, color, desk, eraser | They are all things you draw or write with. | 1
eyes, nose, mouth => cheek | arm, hat, foot, knee | They are all parts of the face. | 1
desk, chair, bed => table | room, wood, pillow, house | They are all pieces of furniture. | 1
eight, twelve, twenty => sixteen | seven, nine, fifteen, eleven | They are all even numbers. | 1
knee, elbow, ankle => wrist | arm, bone, finger, foot | They are all joints, places where the body bends. | 2
happy, glad, cheerful => joyful | sad, laugh, smile, party | They all mean happy. | 2
whisper, mutter, mumble => murmur | shout, yell, listen, ear | They are all quiet ways of speaking. | 2
inch, metre, mile => kilometre | pound, litre, hour, ruler | They are all units for measuring length. | 2
Mars, Venus, Saturn => Jupiter | moon, star, sun, comet | They are all planets. | 2
whale, dolphin, seal => walrus | shark, fish, octopus, crab | They are all sea animals that are mammals. (A shark is a fish.) | 2
copper, iron, silver => gold | wood, rock, glass, coin | They are all metals. | 2
violin, cello, harp => guitar | drum, trumpet, flute, bow | They are all instruments played with strings. | 2
ant, beetle, fly => wasp | spider, worm, snail, bird | They are all insects. (A spider has 8 legs, so it isn’t an insect.) | 2
bee, butterfly, moth => dragonfly | bird, bat, worm, flower | They are all insects with wings. | 2
drizzle, sleet, hail => snow | cloud, umbrella, wind, puddle | They are all kinds of weather that fall from the sky. | 2
cub, kitten, puppy => calf | dog, cat, bear, cow | They are all baby animals. | 2
ruby, emerald, sapphire => diamond | gold, ring, glass, rock | They are all precious gems. | 2
canoe, kayak, raft => sailboat | car, paddle, river, oar | They are all kinds of boats. | 2
add, subtract, multiply => divide | number, equal, plus, answer | They are all math operations. | 2
river, stream, creek => brook | lake, pond, ocean, bridge | They are all flowing water. (Lakes and ponds stay still.) | 2
sunny, rainy, windy => cloudy | weather, umbrella, rain, sun | They are all words that describe the weather. | 2
ladder, stairs, elevator => escalator | floor, roof, door, window | They are all ways to go up and down. | 2
north, east, south => west | map, compass, left, up | They are all compass directions. | 2
cheese, yogurt, butter => cream | bread, egg, cow, juice | They are all dairy foods made from milk. | 2
ear, nose, tongue => eye | hair, foot, tooth, knee | They are all body parts we use for our senses. | 2
penny, nickel, dime => quarter | wallet, bank, money, price | They are all coins. | 2
Canada, France, Japan => Brazil | Paris, Europe, Toronto, ocean | They are all countries. | 2
hop, skip, jump => leap | legs, frog, high, floor | They are all ways of springing off the ground. | 2
joy, anger, fear => surprise | smile, heart, face, brain | They are all feelings. | 2
thermometer, ruler, scale => clock | number, heavy, kitchen, weight | They are all tools for measuring. | 2
bold, brave, daring => fearless | timid, scared, shy, careful | They all mean brave. | 3
enormous, huge, gigantic => massive | tiny, elephant, tall, wide | They all mean very big. | 3
swift, rapid, quick => speedy | slow, runner, race, cheetah | They all mean fast. | 3
author, poet, novelist => playwright | book, reader, library, pen | They are all people who write. | 3
sphere, cube, cylinder => cone | circle, square, triangle, line | They are all solid 3-D shapes. (Circles and squares are flat.) | 3
noun, verb, adjective => adverb | sentence, word, spelling, comma | They are all parts of speech. | 3
triangle, pentagon, hexagon => octagon | circle, cube, oval, sphere | They are all flat shapes with straight sides. | 3
seven, eleven, thirteen => seventeen | nine, fifteen, twenty-one, twelve | They are all prime numbers. (9, 15 and 21 are odd but not prime.) | 3
wolf, shark, eagle => lion | cow, rabbit, deer, sheep | They are all animals that hunt other animals. | 3
kilogram, gram, pound => ounce | metre, litre, inch, scale | They are all units for measuring weight. | 3
hour, minute, second => week | clock, watch, time, calendar | They are all units of time. | 3
courage, honesty, kindness => patience | brave, honest, nice, gentle | They are all nouns naming good qualities. (The others are describing words.) | 3
quickly, slowly, quietly => carefully | quick, slow, loud, careful | They are all words that tell HOW something is done (adverbs ending in -ly). | 3
ran, swam, flew => sang | run, swim, fly, singing | They are all verbs in the past tense. | 3
mice, geese, children => teeth | mouse, goose, child, tooth | They are all plurals that don’t end in -s. | 3
weekly, daily, monthly => yearly | week, day, month, calendar | They all tell how often something happens. | 3
frog, toad, salamander => newt | lizard, snake, fish, turtle | They are all amphibians. (Lizards, snakes and turtles are reptiles.) | 3
Toronto, Chicago, London => Mumbai | Ontario, Canada, river, airport | They are all cities. | 3
igloo, cabin, castle => cottage | snow, wood, king, roof | They are all buildings people live in. | 3
kidney, heart, lung => liver | skin, hair, nail, tooth | They are all organs inside the body. | 3
`;

PP.BANK.sentences = `
The baby was so ___ that she fell asleep right away. => tired | hungry, awake, loud, playful | Falling asleep right away means she was tired. | 1
We need an umbrella because it is ___ outside. => raining | sunny, windy, dark, hot | You use an umbrella when it rains. | 1
The ice cream ___ in the hot sun. => melted | froze, grew, broke, slept | Heat makes ice cream melt. | 1
Sam put on his ___ because his feet were cold. => socks | hat, gloves, glasses, scarf | Socks keep your feet warm. | 1
You use ___ to cut paper. => scissors | glue, tape, crayons, pencils | Scissors are for cutting. | 1
The dog wagged its ___ because it was happy. => tail | ears, bone, paw, collar | Dogs wag their tails when they are happy. | 1
After running the race, Mia was very ___. => thirsty | cold, quiet, short, early | Running makes you thirsty. | 1
Birds build ___ in trees to lay their eggs. => nests | houses, holes, webs, hives | Birds lay eggs in nests. | 1
When the teacher asked a question, Ava raised her hand to give the ___. => answer | question, pencil, homework, recess | You raise your hand to answer a question. | 1
We could not see the stars because the sky was ___. => cloudy | clear, blue, bright, starry | Clouds hide the stars. | 1
The farmer planted ___ in the spring, and they grew into tall corn. => seeds | rocks, bricks, eggs, leaves | Corn grows from seeds. | 1
You use toothpaste to clean your ___. => teeth | shoes, hands, dishes, hair | Toothpaste is for teeth. | 1
The kitten was too ___ to climb down from the tall tree. => scared | big, happy, hungry, fast | Being scared would stop it from climbing down. | 1
It was so dark that we needed a ___ to see. => flashlight | blanket, map, spoon, ball | A flashlight helps you see in the dark. | 1
Noah woke up late, so he ___ all the way to school. => ran | slept, sat, crawled, napped | If you are late, you hurry. | 1
Mom asked us to speak ___ because the baby was sleeping. => softly | loudly, quickly, clearly, often | Speaking softly won't wake the baby. | 1
Because the bridge was ___, the cars had to take a different road. => closed | open, long, new, wide | If a bridge is closed, cars can't use it. | 2
The cookies were ___, so we ate every one of them. => delicious | burnt, tiny, salty, hard | You eat them all because they taste great. | 2
Leo was ___ to see his grandparents, whom he had not visited in a year. => eager | bored, afraid, unable, sorry | After a long time apart, he would be eager (excited) to see them. | 2
The ___ hiker carried extra water, a map and a first-aid kit. => careful | careless, lost, lazy, sleepy | Packing all those safety things shows the hiker is careful. | 2
The museum has a huge ___ of dinosaur bones. => collection | library, picture, story, store | A museum keeps a collection of things. | 2
Although the puzzle looked easy, it was actually quite ___. => difficult | simple, quick, small, easy | “Although” signals the opposite of what it looked like. | 2
The river was so ___ that we could see the fish at the bottom. => clear | deep, muddy, fast, cold | You can only see the bottom if the water is clear. | 2
Zara practised piano every day, so her playing ___ a lot. => improved | stopped, worsened, forgot, broke | Practice makes you get better. | 2
The ___ of the mountain was covered with snow. => peak | valley, river, cave, root | The peak is the top of the mountain. | 2
A ___ animal sleeps during the day and is awake at night. => nocturnal | wild, tame, sleepy, hungry | Nocturnal means active at night. | 2
The class was so ___ that you could hear a pin drop. => silent | noisy, busy, crowded, large | “Hear a pin drop” means it was very quiet. | 2
Plants need sunlight, water and air in order to ___. => grow | sleep, move, shrink, talk | Plants use these things to grow. | 2
The weather report ___ heavy snow, so school was cancelled. => predicted | forgot, stopped, painted, melted | A weather report predicts (tells ahead of time) the weather. | 2
Owen was ___ when he lost his favourite toy. => upset | thrilled, proud, sleepy, lucky | Losing something you love makes you upset. | 2
We put the leftovers in the ___ so they would stay cold. => refrigerator | oven, cupboard, sink, closet | A refrigerator keeps food cold. | 2
The glass fell on the floor and ___ into pieces. => shattered | bounced, melted, floated, folded | Glass shatters (breaks into pieces). | 2
Theo ___ his bike every day, so he became a strong rider. => rode | washed, sold, painted, hid | Riding every day makes you a strong rider. | 2
Since it was her birthday, Anya felt ___ all day. => special | ordinary, sick, sleepy, worried | Birthdays make people feel special. | 2
Jin felt ___ when he won first prize at the science fair. => proud | ashamed, bored, angry, sorry | Winning makes you proud. | 2
The tall giraffe could easily reach the ___ leaves. => highest | lowest, fallen, oldest, smallest | Being tall lets it reach high leaves. | 2
Our teacher ___ the rules so everyone would understand them. => explained | forgot, broke, hid, erased | Explaining helps people understand. | 2
The baker woke up early to ___ fresh bread. => bake | eat, fold, freeze, paint | A baker bakes bread. | 2
Before beginning the experiment, the scientist made a careful ___ about what would happen. => prediction | mistake, accident, explosion, dinner | A prediction is a guess about what will happen. | 3
The old map was so ___ that it tore when we unfolded it. => fragile | sturdy, colorful, large, accurate | Fragile things break or tear easily. | 3
Because the speech was so ___, many people in the audience fell asleep. => boring | exciting, short, loud, funny | People fall asleep during boring speeches. | 3
The detective found a ___ that helped her solve the mystery. => clue | crime, question, thief, reward | A clue helps solve a mystery. | 3
Kai is very ___: he always tells the truth, even when it is hard. => honest | clever, shy, funny, rude | Telling the truth means being honest. | 3
The ___ desert gets almost no rain all year. => arid | tropical, rainy, lush, muddy | Arid means very dry. | 3
The two friends had a ___ about whose turn it was, but they soon made up. => disagreement | party, game, secret, holiday | “Made up” means they fixed a disagreement. | 3
Lila was ___ about the test, so she studied extra hard the night before. => anxious | careless, relaxed, certain, forgetful | Being anxious (worried) made her study more. | 3
The ___ of the story is the lesson it teaches. => moral | title, author, cover, page | The moral is the lesson of a story. | 3
After the storm, the yard was ___ with fallen branches. => littered | painted, empty, decorated, clean | Littered means covered with scattered things. | 3
The ___ water of the lake reflected the mountains like a mirror. => calm | rough, stormy, muddy, rushing | Only still, calm water reflects like a mirror. | 3
The new student was ___ at first, but soon made many friends. => shy | popular, loud, famous, friendly | “At first … but soon” means she changed. Shy fits. | 3
The crowd ___ loudly when the team scored the winning goal. => cheered | whispered, slept, frowned, sighed | Crowds cheer when their team scores. | 3
She was so ___ that she shared her lunch with everyone at the table. => generous | greedy, hungry, selfish, sleepy | Sharing with everyone is generous. | 3
Since the instructions were ___, nobody knew what to do. => confusing | clear, simple, helpful, short | Nobody knew what to do, so the instructions were confusing. | 3
Because the jar was ___, we could see the cookies inside. => transparent | empty, heavy, sealed, opaque | Transparent means see-through. | 3
The athlete showed great ___ by finishing the race despite her injury. => determination | laziness, fear, weakness, boredom | Finishing while hurt shows determination. | 3
The hikers were ___ after the long climb, so they rested before going on. => exhausted | energetic, cheerful, lost, early | Resting after a long climb means they were very tired. | 3
The magician’s trick was so ___ that nobody could figure out how it worked. => baffling | obvious, simple, boring, short | Baffling means very puzzling. | 3
Because the path was ___, we had to walk in a single line. => narrow | wide, long, sunny, muddy | A narrow path only fits one person at a time. | 3
The ___ student finished every assignment on time and checked her work twice. => diligent | lazy, careless, forgetful, late | Diligent means hard-working and careful. | 3
`;

PP.BANK.vocab = `
syn happy => glad | sad, angry, tired | Glad means happy. | 1
syn big => large | tiny, short, slow | Large means big. | 1
syn begin => start | end, stop, wait | To begin is to start. | 1
syn quick => fast | slow, late, quiet | Quick means fast. | 1
syn shout => yell | whisper, sing, listen | To shout is to yell. | 1
syn small => little | huge, tall, wide | Small means little. | 1
syn smart => clever | silly, lazy, loud | Clever means smart. | 1
syn scared => afraid | brave, calm, proud | Scared means afraid. | 1
syn gift => present | party, card, box | A gift is a present. | 1
syn ill => sick | healthy, tired, sad | Ill means sick. | 1
syn pretty => beautiful | ugly, plain, old | Pretty means beautiful. | 1
syn shut => close | open, push, break | To shut is to close. | 1
ant hot => cold | warm, sunny, burning | Cold is the opposite of hot. | 1
ant full => empty | heavy, big, round | Empty is the opposite of full. | 1
ant early => late | soon, first, morning | Late is the opposite of early. | 1
ant awake => asleep | alert, tired, ready | Asleep is the opposite of awake. | 1
ant float => sink | swim, drift, sail | Sink is the opposite of float. | 1
ant laugh => cry | smile, giggle, talk | Cry is the opposite of laugh. | 1
ant remember => forget | know, think, recall | Forget is the opposite of remember. | 1
ant noisy => quiet | loud, busy, happy | Quiet is the opposite of noisy. | 1
ant always => never | often, sometimes, usually | Never is the opposite of always. | 1
ant arrive => leave | come, enter, reach | To leave is the opposite of to arrive. | 1
syn enormous => huge | tiny, heavy, round | Enormous means huge. | 2
syn brave => courageous | fearful, timid, foolish | Courageous means brave. | 2
syn tidy => neat | messy, dusty, empty | Tidy means neat. | 2
syn rapid => swift | slow, steady, careful | Rapid and swift both mean very fast. | 2
syn whole => entire | part, broken, half | Whole means entire (all of it). | 2
syn rude => impolite | kind, polite, shy | Rude means impolite. | 2
syn tale => story | tail, song, map | A tale is a story. (Tail sounds the same but means something else!) | 2
syn mend => repair | break, borrow, bend | To mend is to repair. | 2
syn gaze => stare | blink, sleep, glance | To gaze is to look at something for a long time, like a stare. | 2
syn weary => tired | rested, lively, worried | Weary means tired. | 2
syn odd => strange | normal, usual, plain | Odd can mean strange. | 2
syn journey => trip | home, map, stay | A journey is a trip. | 2
syn chilly => cold | warm, hot, windy | Chilly means cold. | 2
syn assist => help | hurt, ask, stop | To assist is to help. | 2
syn gleaming => shiny | dull, dark, rough | Gleaming means shiny. | 2
ant ancient => modern | old, broken, historic | Modern is the opposite of ancient. | 2
ant generous => selfish | kind, giving, rich | Selfish is the opposite of generous. | 2
ant victory => defeat | win, triumph, game | Defeat is the opposite of victory. | 2
ant expand => shrink | grow, stretch, enlarge | Shrink is the opposite of expand. | 2
ant rough => smooth | bumpy, coarse, hard | Smooth is the opposite of rough. | 2
ant visible => hidden | seen, clear, bright | Hidden is the opposite of visible. | 2
ant cautious => reckless | careful, slow, wise | Reckless is the opposite of cautious. | 2
ant include => exclude | add, contain, invite | Exclude is the opposite of include. | 2
ant permanent => temporary | lasting, forever, fixed | Temporary is the opposite of permanent. | 2
ant shallow => deep | wide, narrow, clear | Deep is the opposite of shallow. | 2
ant plentiful => scarce | many, abundant, enough | Scarce is the opposite of plentiful. | 2
ant ascend => descend | climb, rise, soar | Descend (go down) is the opposite of ascend (go up). | 2
syn fragile => delicate | sturdy, heavy, solid | Fragile means delicate (easily broken). | 3
syn reluctant => unwilling | eager, ready, happy | Reluctant means unwilling. | 3
syn vast => immense | narrow, tiny, crowded | Vast means immense (very large). | 3
syn baffled => puzzled | certain, pleased, bored | Baffled means puzzled. | 3
syn abundant => plentiful | scarce, rare, empty | Abundant means plentiful. | 3
syn conceal => hide | reveal, show, find | To conceal is to hide. | 3
syn timid => shy | bold, loud, proud | Timid means shy. | 3
syn hazardous => dangerous | safe, harmless, careful | Hazardous means dangerous. | 3
syn ponder => think | ignore, forget, shout | To ponder is to think carefully. | 3
syn diligent => hardworking | lazy, careless, clever | Diligent means hardworking. | 3
syn peculiar => unusual | ordinary, common, normal | Peculiar means unusual. | 3
syn vacant => empty | full, busy, crowded | Vacant means empty. | 3
syn tranquil => peaceful | noisy, stormy, busy | Tranquil means peaceful. | 3
syn famished => starving | full, thirsty, tired | Famished means starving. | 3
syn colossal => gigantic | miniature, average, narrow | Colossal means gigantic. | 3
ant courteous => rude | polite, kind, gentle | Rude is the opposite of courteous (polite). | 3
ant transparent => opaque | clear, glassy, bright | Opaque (can’t see through) is the opposite of transparent. | 3
ant optimistic => pessimistic | hopeful, cheerful, positive | Pessimistic is the opposite of optimistic. | 3
ant feeble => strong | weak, frail, tired | Strong is the opposite of feeble (weak). | 3
ant novice => expert | beginner, student, rookie | An expert is the opposite of a novice (beginner). | 3
ant reveal => conceal | show, display, uncover | Conceal (hide) is the opposite of reveal. | 3
ant sincere => fake | honest, true, genuine | Fake is the opposite of sincere. | 3
ant hasty => slow | quick, rushed, speedy | Hasty means in a hurry, so slow is the opposite. | 3
ant flexible => rigid | bendy, soft, stretchy | Rigid (stiff) is the opposite of flexible. | 3
ant frequent => rare | often, regular, common | Rare is the opposite of frequent. | 3
ant ample => insufficient | plenty, enough, large | Insufficient (not enough) is the opposite of ample. | 3
ant humble => boastful | modest, quiet, shy | Boastful (bragging) is the opposite of humble. | 3
ant vague => clear | fuzzy, unclear, dim | Clear is the opposite of vague. | 3
`;

// OLSAT-style verbal reasoning: logical selection ("always has") + inference
PP.BANK.reasoning = `
A bicycle always has => wheels | a bell, a basket, a rider, lights | Every bicycle has wheels. Bells, baskets and lights are extras, and a parked bike has no rider. | 1
A book always has => pages | pictures, a hero, a dragon, a bookmark | Every book has pages. Many books have no pictures or heroes. | 1
A tree always has => roots | apples, leaves, a nest, flowers | Every tree has roots. Many trees lose their leaves in winter. | 1
A song always has => sound | words, a guitar, a singer, a piano | Some songs have no words, and many have no guitar or piano. But every song has sound. | 1
A house always has => a roof | a garage, a garden, a chimney, a basement | Every house has a roof. The others are found in only some houses. | 1
A shoe always has => a sole | laces, a buckle, a sock, velcro | Every shoe has a sole (the bottom). Not all shoes have laces or buckles. | 1
A pizza always has => crust | cheese, pepperoni, mushrooms, a box | Every pizza has a crust. Some pizzas have no cheese. | 1
A bird always has => feathers | a nest, a song, a cage, flight | Every bird has feathers. Penguins and ostriches can’t fly. | 1
A garden always has => plants | flowers, a fence, a gnome, vegetables | Every garden has plants. Not all have flowers or vegetables. | 1
A lake always has => water | fish, boats, ice, a beach | Every lake has water. The others are only sometimes true. | 1
A circle always has => a centre | a colour, corners, a label, numbers | Every circle has a centre. Circles have no corners. | 1
All of Ana’s toys are red. The ball is one of Ana’s toys. So the ball is => red | blue, big, new, soft | All of her toys are red, and the ball is one of her toys. So it must be red. | 1
A race always has => a finish | a trophy, runners, a crowd, a whistle | Every race has a finish. Car races and swimming races have no runners. | 2
A guitar always has => strings | a pick, a strap, a case, a player | Every guitar has strings. The other things are extras. | 2
A game always has => rules | a ball, a board, a winner, dice | Every game has rules. Some games have no ball or board, and some end in a tie. | 2
A shadow always needs => light | the sun, a tree, a wall, night | Shadows need light, but a lamp works too, not only the sun. | 2
A fire always needs => air | wood, matches, a fireplace, smoke | Fire needs air (oxygen). It doesn’t always use wood or matches. | 2
A school always has => students | a gym, buses, a playground, lockers | A school always has students. The rest are only at some schools. | 2
A sandwich always has => bread | cheese, ham, lettuce, a plate | Every sandwich has bread. The fillings change. | 2
A map always shows => places | roads, cities, oceans, a compass | Every map shows places. Not every map has roads, cities or oceans. | 2
Every bloop is a zib. Every zib is blue. Which must be true? => Every bloop is blue | Every blue thing is a bloop, Some zibs are not blue, No bloops are blue | Bloops are zibs, and all zibs are blue, so all bloops are blue. | 2
If it rains, the picnic is cancelled. The picnic was NOT cancelled. What do we know? => It did not rain | It rained, The picnic was moved, It was very windy | If it had rained, the picnic would have been cancelled. It wasn’t, so it didn’t rain. | 2
Some cats have stripes. Tom is a cat. Which is true? => Tom may or may not have stripes | Tom has stripes, Tom has no stripes, Tom is not a cat | Only SOME cats have stripes, so we can’t be sure about Tom. | 2
No fish can climb trees. Goldie is a fish. Which is true? => Goldie cannot climb trees | Goldie can climb trees, Goldie lives in a tree, Goldie is a bird | No fish can climb trees, and Goldie is a fish. | 2
Maya always wears a hat when it is sunny. Today Maya is not wearing a hat. What do we know? => It is not sunny today | It is sunny today, Maya lost her hat, It is raining today | If it were sunny she would be wearing a hat. She isn’t, so it isn’t sunny. (We don’t know if it is raining.) | 2
Today is Wednesday. What day was it the day before yesterday? => Monday | Tuesday, Friday, Sunday, Thursday | Yesterday was Tuesday, so the day before yesterday was Monday. | 2
A triangle always has => three corners | equal sides, a right angle, a point at the top, a colour | Every triangle has three corners. Not all have equal sides or a right angle, and they can be turned any way. | 3
An island always has => water around it | trees, sand, people, a beach | An island is land with water all around it. | 3
A recipe always has => steps to follow | an oven, sugar, a picture, a chef | Every recipe gives steps. Many recipes need no oven or sugar. | 3
A mammal always has => lungs | legs, a tail, fur, spots | All mammals breathe with lungs. Whales have no legs and no fur. | 3
A coin always has => two sides | a face, a number, gold, a hole | Every coin has two sides. The rest are only on some coins. | 3
A thermometer always measures => temperature | fevers, weather, the sun, water | A thermometer measures temperature, whether of a person, the air or water. | 3
All squares are rectangles. Shape X is not a rectangle. Which must be true? => X is not a square | X is a square, X is a circle, X is a triangle | If X were a square, it would be a rectangle. So X can’t be a square. (We don’t know what it is.) | 3
Everyone in the chess club also plays piano. Omar plays piano. Which must be true? => Omar might or might not be in the chess club | Omar is in the chess club, Omar is not in the chess club, Omar plays chess | Chess club members play piano, but other people may play piano too. | 3
Only students with a ticket can enter the show. Rosa entered the show. Which must be true? => Rosa had a ticket | Rosa had no ticket, Rosa is a teacher, Rosa sneaked in | Only ticket holders can enter, so Rosa had a ticket. | 3
Felix has two sisters. Each of his sisters has exactly one brother. How many children are in the family? => 3 | 4, 5, 2, 6 | The sisters’ one brother is Felix himself: Felix + 2 sisters = 3 children. | 3
All Wugs are Pibs. Some Pibs are Zots. Which MUST be true? => None of these has to be true | All Wugs are Zots, Some Wugs are Zots, No Wugs are Zots | The Pibs that are Zots might not be Wugs, so we can’t be sure about any of these. | 3
Some birds cannot fly. Robins are birds. Using only these facts, which is true? => We can’t tell if robins can fly | Robins cannot fly, No birds can fly, All birds are robins | The facts only say SOME birds can’t fly. They don’t say whether robins are among them. | 3
In a race, Ira finished before Jin but after Kai. Who finished first? => Kai | Ira, Jin, We can’t tell | Kai finished before Ira, and Ira before Jin: Kai, Ira, Jin. | 3
A is to the left of B. C is to the right of B. Which one is in the middle? => B | A, C, We can’t tell | A, B, C from left to right: B is in the middle. | 3
`;

// Sentences used for OLSAT-style "sentence arrangement" (fixed word order)
PP.BANK.arrange = `
The hungry boy ate a sandwich
Bees make sweet honey
The baker sells fresh bread
Our teacher reads us a story
The farmer milks his cows
The hungry lion chased a zebra
The dentist cleaned my teeth
The chef cooked a delicious meal
The children built a tall snowman
The mail carrier delivered three letters
My brother broke his arm
The puppy chewed my new shoe
The students cleaned their messy classroom
A caterpillar becomes a butterfly
The musician played a beautiful song
Spiders spin webs to catch insects
Plants need water to grow
Squirrels gather acorns for winter
Kangaroos carry babies in pouches
Doctors help sick people
The artist painted a colorful mural
My grandfather grows juicy tomatoes
The scientist studied tiny bacteria
Elephants have long trunks
Lightning struck an old oak
The goalie blocked every shot
Tom's dog dug a deep hole
The queen wore a golden crown
My mother baked chocolate cookies
Cats chase small mice
Our class planted sunflower seeds
The cow gave fresh milk
Ducks have webbed feet
The wizard waved his magic wand
Zara read an exciting book
Turtles carry their shells
Penguins eat cold fish
`;
