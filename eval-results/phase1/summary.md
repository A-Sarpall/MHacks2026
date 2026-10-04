# Cue recognition eval

## webgpu (2026-10-04, 489 s)

### test-images-public/dev, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 41% | 56% | 51% | 12% | 12% | 9% | 122 / 209 | 170 | vocab 253, none 24 |
| coco | 172 | 47% | 62% | 66% | 15% | 14% | 4% | 116 / 207 | 160 | vocab 165, none 7 |
| cluttered | 131 | 44% | 60% | 66% | 18% | 14% | 3% | 121 / 212 | 166 | vocab 127, none 4 |
| fruit | 12 | 50% | 83% | 67% | 8% | 42% | 0% | 135 / 263 | 240 | vocab 12 |
| held | 105 | 31% | 45% | 27% | 6% | 9% | 16% | 132 / 212 | 185 | vocab 88, none 17 |
| vizwiz | 105 | 31% | 45% | 27% | 6% | 9% | 16% | 132 / 212 | 185 | vocab 88, none 17 |
| food & meals | 34 | 24% | 41% | 44% | 0% | 32% | 15% | 146 / 235 | 194 | vocab 29, none 5 |
| clothes & accessories | 11 | 73% | 73% | 73% | 0% | 0% | 0% | 91 / 152 | 139 | vocab 11 |
| table | 41 | 59% | 71% | 66% | 7% | 15% | 7% | 102 / 152 | 142 | vocab 38, none 3 |
| single | 41 | 59% | 71% | 66% | 7% | 15% | 7% | 102 / 152 | 142 | vocab 38, none 3 |
| furniture & home | 48 | 38% | 58% | 60% | 19% | 13% | 8% | 113 / 222 | 157 | vocab 44, none 4 |
| drinks | 16 | 19% | 19% | 13% | 6% | 0% | 13% | 159 / 227 | 207 | vocab 14, none 2 |
| office & reading | 5 | 40% | 40% | 0% | 0% | 0% | 20% | 118 / 179 | 158 | vocab 4, none 1 |
| kitchen & dining | 46 | 46% | 52% | 52% | 22% | 0% | 9% | 125 / 193 | 169 | vocab 42, none 4 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 85 / 159 | 132 | vocab 7 |
| pets & animals | 18 | 72% | 94% | 89% | 6% | 17% | 0% | 90 / 166 | 142 | vocab 18 |
| electronics & media | 28 | 50% | 64% | 61% | 14% | 7% | 4% | 119 / 206 | 158 | vocab 27, none 1 |
| bathroom & hygiene | 13 | 23% | 31% | 15% | 0% | 0% | 15% | 133 / 178 | 186 | none 2, vocab 11 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 0% | 132 / 164 | 174 | vocab 2 |
| people & body | 12 | 0% | 42% | 58% | 42% | 33% | 0% | 127 / 186 | 166 | vocab 12 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 120 / 120 | 156 | vocab 1 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 79 / 110 | 110 | none 1, vocab 2 |
| health & medical | 3 | 0% | 0% | 33% | 33% | 0% | 33% | 145 / 171 | 180 | vocab 2, none 1 |
| personal items | 13 | 62% | 69% | 23% | 0% | 0% | 23% | 128 / 187 | 165 | vocab 10, none 3 |
| leisure & play | 5 | 80% | 80% | 60% | 0% | 0% | 0% | 100 / 139 | 137 | vocab 5 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 79% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 95% | scanner (blurry) | fruit, apple, pear |
| vizwiz-apple-00689.jpg | apple | fruit | 61% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | vegetable | 56% | scanner | vegetable, carrot, pumpkin |
| backpack-01.jpg | backpack | backpack | 88% | auto | backpack, book, purse |
| vizwiz-backpack-00499.jpg | backpack | blanket | 14% | scanner | blanket, jacket, coat |
| banana-04.jpg | banana | banana | 74% | auto | banana, apple, pear |
| banana-01.jpg | banana | banana | 35% | scanner (blurry) | banana, face, corn |
| banana-06.jpg | banana | fruit | 59% | scanner (blurry) | fruit, banana, corn |
| banana-05.jpg | banana | banana | 85% | auto | banana, lime, cucumber |
| banana-02.jpg | banana | banana | 90% | auto | banana, lemon, corn |
| bed-12.jpg | bed | blanket | 19% | scanner | blanket, bedpan, bed |
| bed-04.jpg | bed | blanket | 72% | auto | blanket, sheets, bed |
| bed-03.jpg | bed | chopsticks | 9% | scanner | chopsticks, notebook, envelope |
| bed-10.jpg | bed | bicycle | 69% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 51% | auto | blanket, sheets, bedpan |
| bed-06.jpg | bed | curtains | 74% | auto | curtains, shower, umbrella |
| bed-01.jpg | bed | remote | 20% | scanner | remote, book, bedpan |
| bed-05.jpg | bed | furniture | 79% | auto | furniture, bed, mattress |
| vizwiz-bed-00316.jpg | bed | furniture | 71% | auto | furniture, bed, pillow |
| bed-09.jpg | bed | furniture | 74% | auto | furniture, blanket, mop |
| vizwiz-beer-00319.jpg | beer | can | 61% | auto | can, dice, soda |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 11% | scanner |  |
| book-01.jpg | book | dog | 18% | scanner | dog, hot dog, teddy bear |
| book-02.jpg | book | crayons | 49% | scanner | crayons, chopsticks, paint |
| bowl-12.jpg | bowl | watermelon | 15% | scanner | watermelon, soup, pasta |
| bowl-04.jpg | bowl | soup | 61% | auto | soup, chopsticks, bowl |
| bowl-02.jpg | bowl | pasta | 60% | auto | pasta, broccoli, noodles |
| bowl-09.jpg | bowl | plate | 15% | scanner | plate, carrot, peas |
| bowl-01.jpg | bowl | broccoli | 65% | auto | broccoli, spinach, peas |
| bowl-07.jpg | bowl | banana | 14% | scanner | banana, lemon, carrot |
| bowl-05.jpg | bowl | food | 63% | auto | food, pie, sweet potato |
| bowl-10.jpg | bowl | carrot | 23% | scanner | carrot, tomato, avocado |
| vizwiz-box-01128.jpg | box | box | 18% | scanner (blurry) | box, package, paper |
| vizwiz-box-00401.jpg | box | box | 19% | scanner | box, package, tissues |
| broccoli-03.jpg | broccoli | vegetable | 68% | auto | vegetable, broccoli, spinach |
| broccoli-01.jpg | broccoli | broccoli | 62% | auto | broccoli, cauliflower, peas |
| cake-07.jpg | cake | food | 70% | auto | food, bread, bagel |
| cake-03.jpg | cake | cake | 62% | auto | cake, peas, rosary |
| vizwiz-cake-01066.jpg | cake | (not sure) | 8% | scanner |  |
| cake-05.jpg | cake | food | 59% | scanner | food, cake, cookie |
| cake-02.jpg | cake | cake | 63% | auto | cake, cupcake, flowers |
| cake-01.jpg | cake | food | 90% | scanner (blurry) | food, cake, cupcake |
| vizwiz-can-00840.jpg | can | (not sure) | 8% | scanner |  |
| vizwiz-can-01184.jpg | can | can | 15% | scanner | can, orange, cup |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 5% | scanner (blurry) |  |
| carrot-01.jpg | carrot | carrot | 79% | auto | carrot, corn, fork |
| carrot-03.jpg | carrot | carrot | 100% | auto | carrot, sweet potato, orange |
| carrot-02.jpg | carrot | carrot | 61% | auto | carrot, orange, sweet potato |
| cat-10.jpg | cat | cat | 99% | auto | cat, squirrel, book |
| cat-11.jpg | cat | cat | 98% | auto | cat, eye, rabbit |
| cat-01.jpg | cat | cat | 98% | auto | cat, rabbit, book |
| cat-02.jpg | cat | cat | 83% | auto | cat, rabbit, orange |
| cat-05.jpg | cat | animal | 72% | auto | animal, bird, cat |
| cat-12.jpg | cat | cat | 66% | auto | cat, squirrel, rabbit |
| cat-03.jpg | cat | animal | 80% | scanner (blurry) | animal, cat, hat |
| cat-07.jpg | cat | cat | 87% | auto | cat, glass, cup |
| chair-10.jpg | chair | (not sure) | 4% | scanner |  |
| chair-07.jpg | chair | chair | 56% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | paper clip | 20% | scanner | paper clip, pen, notebook |
| chair-01.jpg | chair | chair | 23% | scanner | chair, ball, hammer |
| chair-02.jpg | chair | mirror | 75% | auto | mirror, chair, ladder |
| chair-04.jpg | chair | chair | 52% | auto | chair, recliner, seat belt |
| vizwiz-chair-00859.jpg | chair | chair | 73% | auto | chair, seat belt, shower chair |
| chair-05.jpg | chair | chair | 55% | auto | chair, recliner, shower chair |
| clock-01.jpg | clock | clock | 94% | auto | clock, lamp, watch |
| clock-04.jpg | clock | clock | 90% | auto | clock, watch, kitchen timer |
| clock-03.jpg | clock | clock | 61% | auto | clock, watch, fork |
| clock-05.jpg | clock | clock | 62% | auto | clock, thermometer, watch |
| vizwiz-coffee-00937.jpg | coffee | mug | 42% | scanner | mug, cup, travel mug |
| vizwiz-coffee-00561.jpg | coffee | jar | 24% | scanner | jar, can, glass |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 8% | scanner |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | flashlight | 16% | scanner | flashlight, computer mouse, light bulb |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 25% | scanner | orange, carrot, soap |
| vizwiz-cookie-00772.jpg | cookie | (not sure) | 4% | scanner (blurry) |  |
| vizwiz-corn-01008.jpg | corn | can | 22% | scanner | can, cup, lighter |
| vizwiz-crackers-00558.jpg | crackers | juice | 19% | scanner | juice, juice box, hand |
| cup-03.jpg | cup | drink | 74% | scanner (blurry) | drink, juice, orange |
| vizwiz-cup-00857.jpg | cup | cup | 48% | auto | cup, mug, tea |
| cup-01.jpg | cup | cup | 47% | auto | cup, can, mug |
| vizwiz-cup-00247.jpg | cup | cup | 89% | scanner (blurry) | cup, measuring cup, mug |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 3% | scanner |  |
| dog-11.jpg | dog | dog | 67% | auto | dog, hot dog, dog leash |
| dog-04.jpg | dog | dog leash | 67% | auto | dog leash, dog, hot dog |
| vizwiz-dog-00025.jpg | dog | coat | 13% | scanner | coat, person, flashlight |
| dog-09.jpg | dog | dog | 85% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 76% | auto | dog, hot dog, carrot |
| dog-12.jpg | dog | animal | 67% | auto | animal, dog, dog leash |
| dog-07.jpg | dog | dog | 74% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 85% | auto | dog, hair, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 53% | auto | dog, hot dog, dog leash |
| dog-01.jpg | dog | dog | 49% | auto | dog, hot dog, dog leash |
| donut-02.jpg | donut | donut | 53% | auto | donut, bagel, cookie |
| donut-01.jpg | donut | donut | 63% | auto | donut, soap, bagel |
| vizwiz-door-00190.jpg | door | airplane | 16% | scanner (blurry) | airplane, knife, pen |
| vizwiz-dresser-00569.jpg | dresser | drawer | 67% | auto | drawer, dresser, cabinet |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 29% | scanner | coat rack, hanger, umbrella |
| vizwiz-finger-00182.jpg | finger | person | 77% | auto | person, finger, leg |
| vizwiz-flower-00395.jpg | flower | flowers | 52% | auto | flowers, flower, flower pot |
| vizwiz-foot-01040.jpg | foot | person | 64% | scanner (blurry) | person, foot, door |
| vizwiz-foot-00080.jpg | foot | person | 61% | auto | person, foot, leg |
| fork-01.jpg | fork | fork | 96% | auto | fork, peas, chopsticks |
| fridge-10.jpg | fridge | (not sure) | 3% | scanner |  |
| fridge-06.jpg | fridge | fridge | 48% | auto | fridge, freezer, door |
| fridge-05.jpg | fridge | chopsticks | 15% | scanner | chopsticks, mirror, pen |
| fridge-01.jpg | fridge | fridge | 55% | auto | fridge, drawer, shelf |
| fridge-04.jpg | fridge | fridge | 72% | auto | fridge, door handle, freezer |
| fridge-08.jpg | fridge | fridge | 41% | scanner | fridge, freezer, uniform |
| fridge-09.jpg | fridge | fridge | 63% | auto | fridge, door, freezer |
| fridge-12.jpg | fridge | (not sure) | 10% | scanner |  |
| vizwiz-glass-00808.jpg | glass | glass | 60% | auto | glass, eye, jar |
| vizwiz-glass-00952.jpg | glass | hand | 22% | scanner | hand, finger, arm |
| vizwiz-hair-00530.jpg | hair | person | 71% | scanner (blurry) | person, hair, head |
| vizwiz-heater-01064.jpg | heater | radiator | 13% | scanner | radiator, heater, ladder |
| vizwiz-heater-00502.jpg | heater | furniture | 70% | auto | furniture, cabinet, hand |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 8% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 78% | scanner (blurry) | jar, jam, honey |
| vizwiz-juice-00422.jpg | juice | juice | 30% | scanner | juice, juice box, soap |
| vizwiz-ketchup-00112.jpg | ketchup | (not sure) | 6% | scanner |  |
| vizwiz-ketchup-00220.jpg | ketchup | (not sure) | 4% | scanner |  |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 14% | scanner | rope, finger, phone charger |
| keyboard-03.jpg | keyboard | keyboard | 72% | auto | keyboard, piano, computer mouse |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 69% | auto | keyboard, dice, keys |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 96% | scanner | keyboard, book, music keyboard |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, keys, music keyboard |
| knife-01.jpg | knife | knife | 97% | auto | knife, ticket, spatula |
| knife-03.jpg | knife | fork | 88% | auto | fork, spoon, chopsticks |
| laptop-07.jpg | laptop | laptop | 27% | scanner | laptop, keyboard, purse |
| laptop-04.jpg | laptop | (not sure) | 5% | scanner |  |
| laptop-05.jpg | laptop | electronics | 61% | auto | electronics, laptop, eye |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 80% | auto | keyboard, piano, music keyboard |
| laptop-06.jpg | laptop | laptop | 73% | auto | laptop, notebook, webcam |
| laptop-02.jpg | laptop | laptop | 75% | auto | laptop, keyboard, webcam |
| laptop-03.jpg | laptop | keyboard | 77% | auto | keyboard, laptop, piano |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 5% | scanner |  |
| vizwiz-lotion-01072.jpg | lotion | carrot | 14% | scanner | carrot, candle, flashlight |
| vizwiz-lotion-00026.jpg | lotion | light bulb | 13% | scanner (blurry) | light bulb, flashlight, lamp |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 7% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | (not sure) | 9% | scanner |  |
| vizwiz-medicine-00339.jpg | medicine | knife | 16% | scanner | knife, spoon, pen |
| microwave-01.jpg | microwave | microwave | 72% | auto | microwave, bread, oven |
| microwave-02.jpg | microwave | microwave | 45% | scanner | microwave, glass, radio |
| vizwiz-milk-00704.jpg | milk | beer | 21% | scanner (blurry) | beer, urinal bottle, baby bottle |
| vizwiz-money-00473.jpg | money | money | 88% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 52% | scanner (blurry) | money, sun, bill |
| vizwiz-monitor-00663.jpg | monitor | banana | 6% | scanner (blurry) | banana, orange, lemon |
| vizwiz-mug-00104.jpg | mug | mug | 73% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 12% | scanner | lemon, mustard, soap |
| orange-01.jpg | orange | fruit | 88% | auto | fruit, orange, apple |
| orange-02.jpg | orange | orange | 61% | auto | orange, lemon, carrot |
| oven-06.jpg | oven | stove | 14% | scanner | stove, oven, radio |
| oven-04.jpg | oven | pizza | 60% | auto | pizza, pie, pancakes |
| oven-05.jpg | oven | rabbit | 12% | scanner | rabbit, dog, cat |
| oven-07.jpg | oven | fridge | 8% | scanner | fridge, lighter, toaster |
| oven-02.jpg | oven | bread | 61% | auto | bread, bagel, pie |
| oven-01.jpg | oven | bread | 14% | scanner | bread, bacon, oven |
| vizwiz-paper-00483.jpg | paper | paper | 44% | scanner (blurry) | paper, bill, ticket |
| vizwiz-pear-00245.jpg | pear | fruit | 90% | scanner (blurry) | fruit, pear, lime |
| vizwiz-pen-00570.jpg | pen | pen | 17% | scanner | pen, pencil, chopsticks |
| person-12.jpg | person | clothes | 94% | auto | clothes, tie, skirt |
| person-06.jpg | person | tie | 45% | auto | tie, person, face |
| person-09.jpg | person | child | 54% | auto | child, baby, corn |
| person-10.jpg | person | hat | 53% | auto | hat, teeth, book |
| person-04.jpg | person | finger | 20% | scanner | finger, soap, hand |
| person-05.jpg | person | clothes | 83% | auto | clothes, tie, face |
| person-02.jpg | person | bandage | 13% | scanner (blurry) | bandage, face, head |
| person-08.jpg | person | toothbrush | 37% | scanner | toothbrush, mouth, spoon |
| vizwiz-phone-00562.jpg | phone | phone | 59% | auto | phone, folder, DVD |
| vizwiz-phone-01124.jpg | phone | phone | 19% | scanner (blurry) | phone, mirror, DVD |
| vizwiz-phone-00274.jpg | phone | flashlight | 29% | scanner (blurry) | flashlight, phone, lighter |
| phone-02.jpg | phone | car | 24% | scanner | car, razor, book |
| phone-01.jpg | phone | (not sure) | 10% | scanner |  |
| vizwiz-phone-01130.jpg | phone | phone | 35% | scanner (blurry) | phone, DVD, wallet |
| vizwiz-picture-00559.jpg | picture | photo frame | 47% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | person | 70% | auto | person, finger, hand |
| vizwiz-pills-01113.jpg | pills | (not sure) | 10% | scanner (blurry) |  |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 84% | auto | pumpkin, corn, orange |
| pizza-10.jpg | pizza | pizza | 60% | auto | pizza, pie, pancakes |
| pizza-08.jpg | pizza | carrot | 17% | scanner | carrot, bacon, pie |
| pizza-02.jpg | pizza | carrot | 12% | scanner | carrot, lettuce, peach |
| pizza-12.jpg | pizza | rice | 15% | scanner | rice, carrot, orange |
| pizza-09.jpg | pizza | food | 70% | auto | food, pizza, glass |
| pizza-11.jpg | pizza | honey | 12% | scanner | honey, mushroom, sweet potato |
| pizza-01.jpg | pizza | carrot | 24% | scanner | carrot, lettuce, orange |
| pizza-07.jpg | pizza | pizza | 67% | auto | pizza, pasta, pie |
| plant-03.jpg | plant | plant | 42% | scanner | plant, Christmas tree, bench |
| plant-01.jpg | plant | flowers | 38% | scanner | flowers, flower, glass |
| plant-04.jpg | plant | fence | 13% | scanner | fence, envelope, camera |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-radio-00642.jpg | radio | radio | 25% | scanner | radio, toaster, ticket |
| vizwiz-remote-00012.jpg | remote | remote | 80% | auto | remote, calculator, dice |
| vizwiz-remote-00387.jpg | remote | remote | 90% | auto | remote, game controller, flashlight |
| remote-01.jpg | remote | remote | 52% | auto | remote, eraser, knife |
| vizwiz-remote-00439.jpg | remote | remote | 91% | auto | remote, lighter, calculator |
| sandwich-08.jpg | sandwich | food | 55% | scanner | food, carrot, taco |
| sandwich-05.jpg | sandwich | food | 59% | scanner | food, bread, carrot |
| sandwich-12.jpg | sandwich | food | 72% | auto | food, sandwich, donut |
| sandwich-07.jpg | sandwich | food | 86% | auto | food, hot dog, pie |
| sandwich-04.jpg | sandwich | food | 86% | auto | food, bagel, hamburger |
| sandwich-02.jpg | sandwich | food | 71% | auto | food, bread, bagel |
| sandwich-06.jpg | sandwich | sandwich | 69% | auto | sandwich, cabbage, taco |
| sandwich-01.jpg | sandwich | food | 70% | auto | food, sandwich, chicken |
| scissors-01.jpg | scissors | scissors | 93% | auto | scissors, eye, knife |
| vizwiz-scissors-00315.jpg | scissors | tool | 58% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | finger | 13% | scanner | finger, hand, mouth |
| vizwiz-shampoo-00631.jpg | shampoo | peas | 27% | scanner | peas, soap, dice |
| vizwiz-shaving-cream-00733.jpg | shaving cream | deodorant | 15% | scanner | deodorant, shaving cream, lighter |
| vizwiz-shaving-cream-00244.jpg | shaving cream | orange | 15% | scanner | orange, carrot, ticket |
| vizwiz-shoes-00005.jpg | shoes | person | 59% | scanner (blurry) | person, foot, leg |
| sink-04.jpg | sink | (not sure) | 4% | scanner (blurry) |  |
| vizwiz-sink-00897.jpg | sink | sink | 43% | scanner | sink, bathroom sink, toilet |
| sink-01.jpg | sink | sink | 82% | auto | sink, soap, bathroom sink |
| sink-03.jpg | sink | foot | 4% | scanner | foot, pear, hammer |
| vizwiz-soap-00460.jpg | soap | blanket | 40% | scanner | blanket, shirt, paper clip |
| vizwiz-soda-01042.jpg | soda | beer | 27% | scanner (blurry) | beer, flashlight, urinal bottle |
| vizwiz-soda-01207.jpg | soda | flashlight | 29% | scanner (blurry) | flashlight, finger, hand |
| sofa-01.jpg | sofa | dog | 17% | scanner | dog, cat, chair |
| sofa-08.jpg | sofa | sofa | 63% | auto | sofa, chair, seat belt |
| sofa-06.jpg | sofa | sofa | 69% | auto | sofa, chair, cushion |
| sofa-04.jpg | sofa | cat | 95% | auto | cat, orange, lemon |
| sofa-03.jpg | sofa | food | 50% | scanner | food, hot dog, plate |
| sofa-11.jpg | sofa | sofa | 81% | auto | sofa, chair, cushion |
| sofa-07.jpg | sofa | furniture | 60% | auto | furniture, sofa, chair |
| sofa-05.jpg | sofa | furniture | 62% | auto | furniture, sofa, chair |
| sofa-10.jpg | sofa | sofa | 69% | auto | sofa, rope, chair |
| vizwiz-soup-00995.jpg | soup | soup | 61% | auto | soup, soap, carrot |
| vizwiz-spinach-01009.jpg | spinach | cup | 28% | scanner | cup, can, soup |
| spoon-02.jpg | spoon | vegetable | 76% | auto | vegetable, spinach, celery |
| spoon-01.jpg | spoon | spoon | 96% | auto | spoon, chopsticks, spatula |
| vizwiz-spray-bottle-00364.jpg | spray bottle | foot | 6% | scanner (blurry) | foot, finger, hand |
| vizwiz-stairs-00699.jpg | stairs | stairs | 61% | auto | stairs, ladder, rope |
| vizwiz-stove-00678.jpg | stove | stove | 13% | scanner | stove, lighter, pot |
| vizwiz-sugar-00134.jpg | sugar | can | 12% | scanner | can, flashlight, baby bottle |
| suitcase-03.jpg | suitcase | suitcase | 17% | scanner | suitcase, DVD, razor |
| suitcase-05.jpg | suitcase | suitcase | 78% | auto | suitcase, orange, DVD |
| suitcase-02.jpg | suitcase | (not sure) | 6% | scanner |  |
| suitcase-01.jpg | suitcase | suitcase | 35% | scanner | suitcase, backpack, seat belt |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 7% | scanner |  |
| teddy-bear-05.jpg | teddy bear | teddy bear | 64% | auto | teddy bear, doll, toy |
| teddy-bear-06.jpg | teddy bear | teddy bear | 98% | auto | teddy bear, honey, doll |
| teddy-bear-02.jpg | teddy bear | teddy bear | 77% | auto | teddy bear, toy, doll |
| teddy-bear-04.jpg | teddy bear | teddy bear | 20% | scanner | teddy bear, pillow, bread |
| vizwiz-tissues-00108.jpg | tissues | tissues | 38% | scanner | tissues, juice, gift |
| toaster-01.jpg | toaster | toaster | 96% | auto | toaster, lighter, kettle |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 91% | auto | toilet paper, paper, paper towel |
| toothbrush-01.jpg | toothbrush | toothbrush | 97% | auto | toothbrush, carrot, toothpaste |
| vizwiz-toy-00367.jpg | toy | orange | 28% | scanner | orange, ball, carrot |
| tv-10.jpg | tv | monitor | 50% | auto | monitor, ticket, computer |
| tv-08.jpg | tv | electronics | 72% | auto | electronics, monitor, envelope |
| tv-05.jpg | tv | monitor | 14% | scanner | monitor, flashlight, juice |
| tv-04.jpg | tv | monitor | 59% | auto | monitor, apple, tv |
| tv-01.jpg | tv | clothes | 53% | scanner | clothes, hat, person |
| vizwiz-tv-00130.jpg | tv | flashlight | 21% | scanner | flashlight, clipboard, lamp |
| tv-07.jpg | tv | tablet stand | 18% | scanner | tablet stand, monitor, webcam |
| tv-06.jpg | tv | tv | 75% | auto | tv, ball, monitor |
| umbrella-11.jpg | umbrella | umbrella | 95% | auto | umbrella, rain, coat |
| umbrella-10.jpg | umbrella | umbrella | 98% | auto | umbrella, kite, balloon |
| umbrella-02.jpg | umbrella | umbrella | 57% | auto | umbrella, kite, swimsuit |
| umbrella-03.jpg | umbrella | umbrella | 78% | auto | umbrella, tent, kite |
| umbrella-12.jpg | umbrella | rolling pin | 18% | scanner | rolling pin, chopsticks, pen |
| umbrella-01.jpg | umbrella | umbrella | 95% | auto | umbrella, balloon, kite |
| umbrella-06.jpg | umbrella | umbrella | 68% | auto | umbrella, rope, tent |
| umbrella-07.jpg | umbrella | umbrella | 86% | auto | umbrella, tent, hat |
| vase-02.jpg | vase | balloon | 47% | auto | balloon, orange, pumpkin |
| vase-04.jpg | vase | vase | 48% | auto | vase, asparagus, flowers |
| vase-01.jpg | vase | horse | 93% | auto | horse, drum, book |
| vizwiz-water-00659.jpg | water | flashlight | 19% | scanner | flashlight, baby bottle, lighter |
| water-bottle-01.jpg | water bottle | lime | 16% | scanner | lime, hand, lemon |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 48% | auto | water bottle, urinal bottle, water |
| vizwiz-wine-00669.jpg | wine | beer | 22% | scanner | beer, urinal bottle, honey |
| vizwiz-wine-00946.jpg | wine | paper | 22% | scanner (blurry) | paper, bill, ticket |
| vizwiz-wine-01068.jpg | wine | flashlight | 17% | scanner (blurry) | flashlight, light bulb, lamp |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 75% | auto | glass, wine, water |
| wine-glass-02.jpg | wine glass | wine | 51% | auto | wine, glass, fork |
| vizwiz-yogurt-01051.jpg | yogurt | CD | 8% | scanner | CD, soap, drum |

### test-images-public/dev, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 42% | 56% | 51% | 12% | 12% | 9% | 118 / 203 | 163 | vocab 253, none 24 |
| coco | 172 | 48% | 63% | 67% | 16% | 13% | 6% | 112 / 199 | 153 | vocab 162, none 10 |
| cluttered | 131 | 44% | 60% | 67% | 18% | 14% | 5% | 116 / 208 | 157 | vocab 124, none 7 |
| fruit | 12 | 67% | 83% | 67% | 8% | 25% | 0% | 98 / 183 | 169 | vocab 12 |
| held | 105 | 32% | 46% | 24% | 5% | 9% | 13% | 127 / 203 | 179 | vocab 91, none 14 |
| vizwiz | 105 | 32% | 46% | 24% | 5% | 9% | 13% | 127 / 203 | 179 | vocab 91, none 14 |
| food & meals | 34 | 26% | 50% | 44% | 0% | 38% | 9% | 140 / 216 | 188 | vocab 31, none 3 |
| clothes & accessories | 11 | 73% | 73% | 73% | 0% | 0% | 0% | 87 / 129 | 133 | vocab 11 |
| table | 41 | 61% | 73% | 66% | 7% | 12% | 7% | 101 / 151 | 140 | vocab 38, none 3 |
| single | 41 | 61% | 73% | 66% | 7% | 12% | 7% | 101 / 151 | 140 | vocab 38, none 3 |
| furniture & home | 48 | 38% | 63% | 60% | 21% | 13% | 10% | 105 / 211 | 148 | vocab 43, none 5 |
| drinks | 16 | 13% | 13% | 13% | 6% | 0% | 13% | 156 / 229 | 204 | vocab 14, none 2 |
| office & reading | 5 | 40% | 40% | 0% | 0% | 0% | 20% | 114 / 172 | 153 | vocab 4, none 1 |
| kitchen & dining | 46 | 46% | 52% | 50% | 22% | 0% | 11% | 122 / 178 | 165 | vocab 41, none 5 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 82 / 161 | 128 | vocab 7 |
| pets & animals | 18 | 72% | 89% | 89% | 6% | 17% | 0% | 83 / 162 | 135 | vocab 18 |
| electronics & media | 28 | 50% | 64% | 61% | 14% | 7% | 4% | 120 / 203 | 159 | vocab 27, none 1 |
| bathroom & hygiene | 13 | 23% | 31% | 15% | 0% | 0% | 15% | 134 / 188 | 188 | none 2, vocab 11 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 0% | 129 / 164 | 171 | vocab 2 |
| people & body | 12 | 8% | 42% | 58% | 42% | 25% | 0% | 149 / 199 | 189 | vocab 12 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 111 / 111 | 144 | vocab 1 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 81 / 115 | 113 | none 1, vocab 2 |
| health & medical | 3 | 0% | 0% | 0% | 0% | 0% | 33% | 144 / 171 | 177 | vocab 2, none 1 |
| personal items | 13 | 62% | 62% | 23% | 0% | 0% | 23% | 118 / 192 | 155 | vocab 10, none 3 |
| leisure & play | 5 | 80% | 80% | 60% | 0% | 0% | 0% | 97 / 133 | 133 | vocab 5 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 52% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 97% | scanner (blurry) | fruit, apple, pear |
| vizwiz-apple-00689.jpg | apple | fruit | 61% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | vegetable | 56% | scanner | vegetable, carrot, pumpkin |
| backpack-01.jpg | backpack | backpack | 88% | auto | backpack, coat, purse |
| vizwiz-backpack-00499.jpg | backpack | blanket | 14% | scanner | blanket, jacket, coat |
| banana-04.jpg | banana | banana | 80% | auto | banana, pear, mango |
| banana-01.jpg | banana | banana | 35% | scanner (blurry) | banana, face, corn |
| banana-06.jpg | banana | banana | 28% | scanner (blurry) | banana, Christmas tree, corn |
| banana-05.jpg | banana | banana | 71% | auto | banana, green beans, lime |
| banana-02.jpg | banana | banana | 85% | auto | banana, corn, lemon |
| bed-12.jpg | bed | blanket | 18% | scanner | blanket, bedpan, bed |
| bed-04.jpg | bed | blanket | 72% | auto | blanket, sheets, bed |
| bed-03.jpg | bed | wallet | 10% | scanner | wallet, chopsticks, notebook |
| bed-10.jpg | bed | bicycle | 94% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 52% | auto | blanket, sheets, bedpan |
| bed-06.jpg | bed | furniture | 52% | scanner | furniture, curtains, bed |
| bed-01.jpg | bed | remote | 20% | scanner | remote, book, bedpan |
| bed-05.jpg | bed | furniture | 79% | auto | furniture, bed, sheets |
| vizwiz-bed-00316.jpg | bed | furniture | 71% | auto | furniture, bed, pillow |
| bed-09.jpg | bed | furniture | 74% | auto | furniture, blanket, mop |
| vizwiz-beer-00319.jpg | beer | can | 61% | auto | can, dice, soda |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 11% | scanner |  |
| book-01.jpg | book | dog | 18% | scanner | dog, hot dog, teddy bear |
| book-02.jpg | book | crayons | 38% | scanner | crayons, pencil, chopsticks |
| bowl-12.jpg | bowl | watermelon | 18% | scanner | watermelon, pasta, peas |
| bowl-04.jpg | bowl | soup | 61% | auto | soup, chopsticks, bowl |
| bowl-02.jpg | bowl | pasta | 60% | auto | pasta, broccoli, noodles |
| bowl-09.jpg | bowl | plate | 15% | scanner | plate, soup, carrot |
| bowl-01.jpg | bowl | broccoli | 57% | auto | broccoli, spinach, peas |
| bowl-07.jpg | bowl | lemon | 25% | scanner | lemon, carrot, orange |
| bowl-05.jpg | bowl | food | 63% | auto | food, pie, fork |
| bowl-10.jpg | bowl | carrot | 23% | scanner | carrot, tomato, avocado |
| vizwiz-box-01128.jpg | box | box | 18% | scanner (blurry) | box, package, paper |
| vizwiz-box-00401.jpg | box | box | 19% | scanner | box, package, tissues |
| broccoli-03.jpg | broccoli | vegetable | 68% | auto | vegetable, broccoli, spinach |
| broccoli-01.jpg | broccoli | broccoli | 82% | auto | broccoli, corn, peas |
| cake-07.jpg | cake | food | 77% | auto | food, bread, bagel |
| cake-03.jpg | cake | cake | 65% | auto | cake, pie, peas |
| vizwiz-cake-01066.jpg | cake | (not sure) | 8% | scanner |  |
| cake-05.jpg | cake | food | 59% | scanner | food, cake, cookie |
| cake-02.jpg | cake | cake | 91% | auto | cake, cupcake, flowers |
| cake-01.jpg | cake | food | 90% | scanner (blurry) | food, cake, cupcake |
| vizwiz-can-00840.jpg | can | (not sure) | 8% | scanner |  |
| vizwiz-can-01184.jpg | can | book | 3% | scanner | book, orange, Bible |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 5% | scanner (blurry) |  |
| carrot-01.jpg | carrot | carrot | 74% | auto | carrot, corn, banana |
| carrot-03.jpg | carrot | carrot | 100% | auto | carrot, sweet potato, orange |
| carrot-02.jpg | carrot | carrot | 93% | auto | carrot, orange, sweet potato |
| cat-10.jpg | cat | cat | 99% | auto | cat, squirrel, book |
| cat-11.jpg | cat | cat | 98% | auto | cat, squirrel, rabbit |
| cat-01.jpg | cat | cat | 98% | auto | cat, rabbit, book |
| cat-02.jpg | cat | cat | 83% | auto | cat, rabbit, orange |
| cat-05.jpg | cat | animal | 72% | auto | animal, bird, rabbit |
| cat-12.jpg | cat | cat | 77% | auto | cat, squirrel, rabbit |
| cat-03.jpg | cat | animal | 80% | scanner (blurry) | animal, cat, eye |
| cat-07.jpg | cat | cat | 94% | auto | cat, rabbit, squirrel |
| chair-10.jpg | chair | (not sure) | 4% | scanner |  |
| chair-07.jpg | chair | chair | 66% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | paper clip | 20% | scanner | paper clip, pen, notebook |
| chair-01.jpg | chair | chair | 24% | scanner | chair, ball, hammer |
| chair-02.jpg | chair | mirror | 90% | auto | mirror, chair, photo frame |
| chair-04.jpg | chair | chair | 52% | auto | chair, recliner, seat belt |
| vizwiz-chair-00859.jpg | chair | chair | 73% | auto | chair, seat belt, shower chair |
| chair-05.jpg | chair | chair | 70% | auto | chair, armchair, recliner |
| clock-01.jpg | clock | clock | 94% | auto | clock, honey, watch |
| clock-04.jpg | clock | clock | 87% | auto | clock, watch, kitchen timer |
| clock-03.jpg | clock | clock | 60% | auto | clock, watch, fork |
| clock-05.jpg | clock | clock | 45% | auto | clock, alarm clock, thermometer |
| vizwiz-coffee-00937.jpg | coffee | mug | 42% | scanner | mug, cup, travel mug |
| vizwiz-coffee-00561.jpg | coffee | jar | 39% | scanner | jar, salt, glass |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 8% | scanner |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | flashlight | 16% | scanner | flashlight, computer mouse, light bulb |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 25% | scanner | orange, carrot, soap |
| vizwiz-cookie-00772.jpg | cookie | food | 64% | scanner (blurry) | food, cookie, bread |
| vizwiz-corn-01008.jpg | corn | can | 22% | scanner | can, cup, lighter |
| vizwiz-crackers-00558.jpg | crackers | hand | 22% | scanner | hand, finger, flashlight |
| cup-03.jpg | cup | drink | 74% | scanner (blurry) | drink, juice, orange |
| vizwiz-cup-00857.jpg | cup | cup | 47% | auto | cup, mug, tea |
| cup-01.jpg | cup | cup | 47% | auto | cup, soda, can |
| vizwiz-cup-00247.jpg | cup | cup | 89% | scanner (blurry) | cup, measuring cup, mug |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 3% | scanner |  |
| dog-11.jpg | dog | dog | 64% | auto | dog, dog leash, hot dog |
| dog-04.jpg | dog | dog leash | 87% | auto | dog leash, dog, hot dog |
| vizwiz-dog-00025.jpg | dog | coat | 13% | scanner | coat, person, flashlight |
| dog-09.jpg | dog | dog | 62% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 77% | auto | dog, hot dog, carrot |
| dog-12.jpg | dog | animal | 67% | auto | animal, dog, hot dog |
| dog-07.jpg | dog | dog | 75% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 85% | auto | dog, squirrel, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 53% | auto | dog, hot dog, dog leash |
| dog-01.jpg | dog | dog | 59% | auto | dog, hot dog, dog leash |
| donut-02.jpg | donut | donut | 53% | auto | donut, bagel, cookie |
| donut-01.jpg | donut | donut | 63% | auto | donut, candy, bagel |
| vizwiz-door-00190.jpg | door | airplane | 16% | scanner (blurry) | airplane, knife, pen |
| vizwiz-dresser-00569.jpg | dresser | drawer | 72% | auto | drawer, dresser, door handle |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 29% | scanner | coat rack, hanger, umbrella |
| vizwiz-finger-00182.jpg | finger | finger | 57% | auto | finger, paper, hand |
| vizwiz-flower-00395.jpg | flower | flowers | 52% | auto | flowers, flower, flower pot |
| vizwiz-foot-01040.jpg | foot | person | 64% | scanner (blurry) | person, foot, door |
| vizwiz-foot-00080.jpg | foot | person | 61% | auto | person, foot, leg |
| fork-01.jpg | fork | fork | 96% | auto | fork, lime, chopsticks |
| fridge-10.jpg | fridge | (not sure) | 4% | scanner |  |
| fridge-06.jpg | fridge | fridge | 76% | auto | fridge, freezer, door |
| fridge-05.jpg | fridge | mirror | 15% | scanner | mirror, door, ladder |
| fridge-01.jpg | fridge | fridge | 55% | auto | fridge, freezer, shelf |
| fridge-04.jpg | fridge | fridge | 72% | auto | fridge, door handle, freezer |
| fridge-08.jpg | fridge | fridge | 41% | scanner | fridge, freezer, uniform |
| fridge-09.jpg | fridge | fridge | 63% | auto | fridge, door, freezer |
| fridge-12.jpg | fridge | (not sure) | 8% | scanner |  |
| vizwiz-glass-00808.jpg | glass | glass | 52% | scanner | glass, jar, cup |
| vizwiz-glass-00952.jpg | glass | hand | 22% | scanner | hand, finger, arm |
| vizwiz-hair-00530.jpg | hair | person | 71% | scanner (blurry) | person, hair, head |
| vizwiz-heater-01064.jpg | heater | radiator | 13% | scanner | radiator, heater, ladder |
| vizwiz-heater-00502.jpg | heater | furniture | 52% | scanner | furniture, drawer, dresser |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 8% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 78% | scanner (blurry) | jar, jam, honey |
| vizwiz-juice-00422.jpg | juice | juice | 30% | scanner | juice, juice box, soap |
| vizwiz-ketchup-00112.jpg | ketchup | ketchup | 16% | scanner | ketchup, soap, lighter |
| vizwiz-ketchup-00220.jpg | ketchup | beer | 18% | scanner | beer, ketchup, carrot |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 14% | scanner | rope, finger, phone charger |
| keyboard-03.jpg | keyboard | keyboard | 95% | auto | keyboard, music keyboard, computer mouse |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 97% | auto | keyboard, laptop, music keyboard |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 96% | scanner | keyboard, book, music keyboard |
| keyboard-01.jpg | keyboard | keyboard | 100% | auto | keyboard, music keyboard, computer mouse |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, keys, music keyboard |
| knife-01.jpg | knife | knife | 97% | auto | knife, fork, spatula |
| knife-03.jpg | knife | fork | 81% | auto | fork, spoon, chopsticks |
| laptop-07.jpg | laptop | laptop | 27% | scanner | laptop, keyboard, purse |
| laptop-04.jpg | laptop | (not sure) | 11% | scanner |  |
| laptop-05.jpg | laptop | electronics | 61% | auto | electronics, laptop, eye |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 80% | auto | keyboard, piano, music keyboard |
| laptop-06.jpg | laptop | laptop | 55% | auto | laptop, keyboard, monitor |
| laptop-02.jpg | laptop | keyboard | 63% | auto | keyboard, laptop, monitor |
| laptop-03.jpg | laptop | laptop | 76% | auto | laptop, envelope, notebook |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 4% | scanner |  |
| vizwiz-lotion-01072.jpg | lotion | carrot | 14% | scanner | carrot, candle, lighter |
| vizwiz-lotion-00026.jpg | lotion | light bulb | 13% | scanner (blurry) | light bulb, flashlight, lamp |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 7% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | (not sure) | 9% | scanner |  |
| vizwiz-medicine-00339.jpg | medicine | knife | 16% | scanner | knife, spoon, pen |
| microwave-01.jpg | microwave | microwave | 72% | auto | microwave, honey, oven |
| microwave-02.jpg | microwave | microwave | 45% | scanner | microwave, glass, radio |
| vizwiz-milk-00704.jpg | milk | beer | 21% | scanner (blurry) | beer, urinal bottle, baby bottle |
| vizwiz-money-00473.jpg | money | money | 88% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 52% | scanner (blurry) | money, sun, bill |
| vizwiz-monitor-00663.jpg | monitor | banana | 6% | scanner (blurry) | banana, orange, lemon |
| vizwiz-mug-00104.jpg | mug | mug | 73% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 12% | scanner | lemon, mustard, soap |
| orange-01.jpg | orange | orange | 58% | auto | orange, lemon, mango |
| orange-02.jpg | orange | orange | 48% | auto | orange, pumpkin, lemon |
| oven-06.jpg | oven | stove | 41% | scanner | stove, oven, toaster |
| oven-04.jpg | oven | food | 84% | auto | food, pizza, pie |
| oven-05.jpg | oven | rabbit | 12% | scanner | rabbit, dog, cat |
| oven-07.jpg | oven | (not sure) | 12% | scanner |  |
| oven-02.jpg | oven | bread | 61% | auto | bread, bagel, pie |
| oven-01.jpg | oven | bread | 14% | scanner | bread, bacon, oven |
| vizwiz-paper-00483.jpg | paper | paper | 44% | scanner (blurry) | paper, bill, ticket |
| vizwiz-pear-00245.jpg | pear | fruit | 90% | scanner (blurry) | fruit, pear, lime |
| vizwiz-pen-00570.jpg | pen | pen | 17% | scanner | pen, pencil, chopsticks |
| person-12.jpg | person | clothes | 94% | auto | clothes, tie, skirt |
| person-06.jpg | person | clothes | 63% | auto | clothes, tie, person |
| person-09.jpg | person | child | 64% | auto | child, baby, corn |
| person-10.jpg | person | hat | 53% | auto | hat, mouth, book |
| person-04.jpg | person | soap | 5% | scanner | soap, baby, lighter |
| person-05.jpg | person | clothes | 83% | auto | clothes, tie, face |
| person-02.jpg | person | bandage | 13% | scanner (blurry) | bandage, face, head |
| person-08.jpg | person | toothbrush | 37% | scanner | toothbrush, mouth, child |
| vizwiz-phone-00562.jpg | phone | phone | 64% | auto | phone, wallet, remote |
| vizwiz-phone-01124.jpg | phone | phone | 19% | scanner (blurry) | phone, mirror, DVD |
| vizwiz-phone-00274.jpg | phone | flashlight | 37% | scanner (blurry) | flashlight, lighter, light bulb |
| phone-02.jpg | phone | car | 24% | scanner | car, razor, book |
| phone-01.jpg | phone | (not sure) | 10% | scanner |  |
| vizwiz-phone-01130.jpg | phone | phone | 49% | scanner (blurry) | phone, DVD, wallet |
| vizwiz-picture-00559.jpg | picture | photo frame | 42% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | hand | 28% | scanner | hand, finger, arm |
| vizwiz-pills-01113.jpg | pills | (not sure) | 10% | scanner (blurry) |  |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 84% | auto | pumpkin, corn, orange |
| pizza-10.jpg | pizza | pizza | 60% | auto | pizza, pie, pancakes |
| pizza-08.jpg | pizza | food | 51% | scanner | food, bacon, pie |
| pizza-02.jpg | pizza | vegetable | 54% | scanner | vegetable, lettuce, carrot |
| pizza-12.jpg | pizza | (not sure) | 10% | scanner |  |
| pizza-09.jpg | pizza | food | 82% | auto | food, pizza, pie |
| pizza-11.jpg | pizza | food | 54% | scanner | food, honey, mushroom |
| pizza-01.jpg | pizza | carrot | 23% | scanner | carrot, lettuce, orange |
| pizza-07.jpg | pizza | pizza | 67% | auto | pizza, pasta, pie |
| plant-03.jpg | plant | Christmas tree | 49% | auto | Christmas tree, tree, plant |
| plant-01.jpg | plant | flowers | 61% | auto | flowers, flower, orange |
| plant-04.jpg | plant | (not sure) | 5% | scanner |  |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-radio-00642.jpg | radio | radio | 25% | scanner | radio, toaster, ticket |
| vizwiz-remote-00012.jpg | remote | remote | 80% | auto | remote, calculator, dice |
| vizwiz-remote-00387.jpg | remote | remote | 90% | auto | remote, game controller, flashlight |
| remote-01.jpg | remote | remote | 52% | auto | remote, eraser, knife |
| vizwiz-remote-00439.jpg | remote | remote | 85% | auto | remote, lighter, keyboard |
| sandwich-08.jpg | sandwich | carrot | 25% | scanner | carrot, bacon, taco |
| sandwich-05.jpg | sandwich | food | 59% | scanner | food, bread, carrot |
| sandwich-12.jpg | sandwich | food | 72% | auto | food, bagel, sandwich |
| sandwich-07.jpg | sandwich | food | 86% | auto | food, hot dog, pie |
| sandwich-04.jpg | sandwich | food | 86% | auto | food, bagel, hamburger |
| sandwich-02.jpg | sandwich | food | 71% | auto | food, bread, sausage |
| sandwich-06.jpg | sandwich | sandwich | 69% | auto | sandwich, cabbage, taco |
| sandwich-01.jpg | sandwich | food | 70% | auto | food, sandwich, broccoli |
| scissors-01.jpg | scissors | scissors | 93% | auto | scissors, hammer, knife |
| vizwiz-scissors-00315.jpg | scissors | tool | 58% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | finger | 13% | scanner | finger, hand, mouth |
| vizwiz-shampoo-00631.jpg | shampoo | peas | 27% | scanner | peas, soap, dice |
| vizwiz-shaving-cream-00733.jpg | shaving cream | deodorant | 15% | scanner | deodorant, shaving cream, lighter |
| vizwiz-shaving-cream-00244.jpg | shaving cream | orange | 15% | scanner | orange, carrot, ticket |
| vizwiz-shoes-00005.jpg | shoes | person | 59% | scanner (blurry) | person, foot, leg |
| sink-04.jpg | sink | (not sure) | 10% | scanner (blurry) |  |
| vizwiz-sink-00897.jpg | sink | sink | 43% | scanner | sink, bathroom sink, toilet |
| sink-01.jpg | sink | sink | 82% | auto | sink, cup, bathroom sink |
| sink-03.jpg | sink | pear | 3% | scanner | pear, foot, book |
| vizwiz-soap-00460.jpg | soap | blanket | 40% | scanner | blanket, shirt, paper clip |
| vizwiz-soda-01042.jpg | soda | beer | 27% | scanner (blurry) | beer, flashlight, urinal bottle |
| vizwiz-soda-01207.jpg | soda | flashlight | 29% | scanner (blurry) | flashlight, finger, hand |
| sofa-01.jpg | sofa | dog | 17% | scanner | dog, cat, chair |
| sofa-08.jpg | sofa | sofa | 82% | auto | sofa, chair, recliner |
| sofa-06.jpg | sofa | sofa | 71% | auto | sofa, chair, cushion |
| sofa-04.jpg | sofa | cat | 89% | auto | cat, orange, spoon |
| sofa-03.jpg | sofa | plate | 14% | scanner | plate, cup, meal |
| sofa-11.jpg | sofa | sofa | 81% | auto | sofa, chair, cushion |
| sofa-07.jpg | sofa | sofa | 71% | auto | sofa, chair, cushion |
| sofa-05.jpg | sofa | furniture | 62% | auto | furniture, sofa, bedpan |
| sofa-10.jpg | sofa | sofa | 69% | auto | sofa, fence, chair |
| vizwiz-soup-00995.jpg | soup | soup | 61% | auto | soup, soap, carrot |
| vizwiz-spinach-01009.jpg | spinach | cup | 28% | scanner | cup, can, soup |
| spoon-02.jpg | spoon | vegetable | 76% | auto | vegetable, spinach, celery |
| spoon-01.jpg | spoon | spoon | 96% | auto | spoon, chopsticks, spatula |
| vizwiz-spray-bottle-00364.jpg | spray bottle | foot | 6% | scanner (blurry) | foot, finger, hand |
| vizwiz-stairs-00699.jpg | stairs | stairs | 61% | auto | stairs, ladder, rope |
| vizwiz-stove-00678.jpg | stove | stove | 13% | scanner | stove, lighter, pot |
| vizwiz-sugar-00134.jpg | sugar | can | 12% | scanner | can, flashlight, baby bottle |
| suitcase-03.jpg | suitcase | suitcase | 17% | scanner | suitcase, DVD, razor |
| suitcase-05.jpg | suitcase | suitcase | 78% | auto | suitcase, orange, DVD |
| suitcase-02.jpg | suitcase | (not sure) | 6% | scanner |  |
| suitcase-01.jpg | suitcase | suitcase | 35% | scanner | suitcase, backpack, seat belt |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 7% | scanner |  |
| teddy-bear-05.jpg | teddy bear | teddy bear | 64% | auto | teddy bear, doll, toy |
| teddy-bear-06.jpg | teddy bear | teddy bear | 97% | auto | teddy bear, honey, doll |
| teddy-bear-02.jpg | teddy bear | teddy bear | 77% | auto | teddy bear, toy, doll |
| teddy-bear-04.jpg | teddy bear | teddy bear | 20% | scanner | teddy bear, pillow, bread |
| vizwiz-tissues-00108.jpg | tissues | tissues | 38% | scanner | tissues, juice, gift |
| toaster-01.jpg | toaster | toaster | 96% | auto | toaster, lighter, kettle |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 91% | auto | toilet paper, paper, paper towel |
| toothbrush-01.jpg | toothbrush | toothbrush | 97% | auto | toothbrush, carrot, toothpaste |
| vizwiz-toy-00367.jpg | toy | orange | 28% | scanner | orange, ball, carrot |
| tv-10.jpg | tv | monitor | 50% | auto | monitor, ticket, computer |
| tv-08.jpg | tv | electronics | 72% | auto | electronics, monitor, envelope |
| tv-05.jpg | tv | paper | 26% | scanner | paper, monitor, flashlight |
| tv-04.jpg | tv | monitor | 59% | auto | monitor, apple, tv |
| tv-01.jpg | tv | hat | 18% | scanner | hat, person, tie |
| vizwiz-tv-00130.jpg | tv | flashlight | 21% | scanner | flashlight, clipboard, lamp |
| tv-07.jpg | tv | tablet stand | 18% | scanner | tablet stand, monitor, webcam |
| tv-06.jpg | tv | tv | 75% | auto | tv, ball, monitor |
| umbrella-11.jpg | umbrella | umbrella | 95% | auto | umbrella, rain, coat |
| umbrella-10.jpg | umbrella | umbrella | 98% | auto | umbrella, kite, balloon |
| umbrella-02.jpg | umbrella | umbrella | 83% | auto | umbrella, kite, swimsuit |
| umbrella-03.jpg | umbrella | umbrella | 85% | auto | umbrella, kite, balloon |
| umbrella-12.jpg | umbrella | rolling pin | 14% | scanner | rolling pin, chopsticks, pen |
| umbrella-01.jpg | umbrella | umbrella | 93% | auto | umbrella, balloon, tent |
| umbrella-06.jpg | umbrella | umbrella | 68% | auto | umbrella, tent, rope |
| umbrella-07.jpg | umbrella | umbrella | 86% | auto | umbrella, tent, hat |
| vase-02.jpg | vase | glass | 51% | auto | glass, pumpkin, vase |
| vase-04.jpg | vase | vase | 48% | auto | vase, asparagus, flowers |
| vase-01.jpg | vase | horse | 94% | auto | horse, book, drum |
| vizwiz-water-00659.jpg | water | flashlight | 19% | scanner | flashlight, baby bottle, lighter |
| water-bottle-01.jpg | water bottle | lime | 16% | scanner | lime, hand, lemon |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 48% | auto | water bottle, glass, urinal bottle |
| vizwiz-wine-00669.jpg | wine | beer | 44% | scanner | beer, urinal bottle, honey |
| vizwiz-wine-00946.jpg | wine | paper | 22% | scanner (blurry) | paper, bill, ticket |
| vizwiz-wine-01068.jpg | wine | flashlight | 17% | scanner (blurry) | flashlight, light bulb, lamp |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 75% | auto | glass, wine, water |
| wine-glass-02.jpg | wine glass | wine | 51% | auto | wine, glass, glasses |
| vizwiz-yogurt-01051.jpg | yogurt | CD | 8% | scanner | CD, soap, drum |

### test-images-public/dev-webcam, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 44% | 58% | 53% | 12% | 12% | 13% | 110 / 207 | 142 | vocab 242, none 35 |
| coco | 172 | 49% | 63% | 68% | 15% | 14% | 6% | 106 / 206 | 138 | vocab 162, none 10 |
| cluttered | 131 | 46% | 60% | 67% | 17% | 15% | 5% | 110 / 208 | 141 | vocab 125, none 6 |
| fruit | 12 | 58% | 83% | 75% | 8% | 33% | 0% | 90 / 206 | 122 | vocab 12 |
| webcam | 277 | 44% | 58% | 53% | 12% | 12% | 13% | 110 / 207 | 142 | vocab 242, none 35 |
| clothes & accessories | 11 | 73% | 73% | 82% | 0% | 9% | 0% | 99 / 187 | 131 | vocab 11 |
| table | 41 | 61% | 73% | 71% | 10% | 10% | 10% | 95 / 154 | 126 | vocab 37, none 4 |
| single | 41 | 61% | 73% | 71% | 10% | 10% | 10% | 95 / 154 | 126 | vocab 37, none 4 |
| furniture & home | 48 | 40% | 60% | 56% | 17% | 13% | 10% | 107 / 208 | 138 | none 5, vocab 43 |
| office & reading | 5 | 40% | 40% | 0% | 0% | 0% | 20% | 100 / 132 | 130 | vocab 4, none 1 |
| kitchen & dining | 46 | 50% | 57% | 54% | 22% | 0% | 11% | 109 / 189 | 140 | vocab 41, none 5 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 95 / 223 | 135 | vocab 7 |
| food & meals | 34 | 24% | 47% | 41% | 3% | 32% | 21% | 133 / 220 | 165 | vocab 27, none 7 |
| pets & animals | 18 | 78% | 89% | 94% | 11% | 11% | 0% | 69 / 155 | 100 | vocab 18 |
| electronics & media | 28 | 54% | 64% | 64% | 18% | 7% | 7% | 103 / 185 | 135 | vocab 26, none 2 |
| people & body | 12 | 17% | 50% | 42% | 33% | 33% | 8% | 111 / 157 | 141 | vocab 11, none 1 |
| personal items | 13 | 69% | 69% | 31% | 0% | 0% | 15% | 104 / 142 | 135 | vocab 11, none 2 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 97 / 164 | 131 | vocab 2, none 1 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 109 / 160 | 141 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 38% | 46% | 31% | 8% | 0% | 31% | 145 / 222 | 181 | vocab 9, none 4 |
| held | 105 | 36% | 49% | 28% | 8% | 10% | 24% | 116 / 222 | 150 | vocab 80, none 25 |
| vizwiz | 105 | 36% | 49% | 28% | 8% | 10% | 24% | 116 / 222 | 150 | vocab 80, none 25 |
| drinks | 16 | 6% | 13% | 19% | 13% | 13% | 25% | 147 / 229 | 182 | vocab 12, none 4 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 50% | 105 / 123 | 145 | vocab 1, none 1 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 43 / 43 | 73 | vocab 1 |
| health & medical | 3 | 0% | 0% | 0% | 0% | 0% | 33% | 126 / 164 | 157 | vocab 2, none 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 93% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 95% | scanner (blurry) | fruit, apple, pear |
| backpack-01.jpg | backpack | backpack | 78% | auto | backpack, trash bag, purse |
| banana-01.jpg | banana | banana | 44% | scanner (blurry) | banana, face, person |
| banana-02.jpg | banana | banana | 63% | auto | banana, lemon, corn |
| banana-04.jpg | banana | banana | 56% | auto | banana, pear, mango |
| banana-05.jpg | banana | banana | 71% | auto | banana, Christmas tree, green beans |
| banana-06.jpg | banana | fruit | 52% | scanner | fruit, banana, corn |
| bed-01.jpg | bed | (not sure) | 5% | scanner |  |
| bed-03.jpg | bed | book | 13% | scanner | book, chopsticks, paper clip |
| bed-04.jpg | bed | blanket | 68% | auto | blanket, sheets, bedpan |
| bed-05.jpg | bed | bed | 47% | auto | bed, bedpan, mattress |
| bed-06.jpg | bed | curtains | 27% | scanner | curtains, bed, tent |
| bed-09.jpg | bed | furniture | 72% | auto | furniture, blanket, sheets |
| bed-10.jpg | bed | bicycle | 70% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | furniture | 59% | scanner | furniture, blanket, cat |
| bed-12.jpg | bed | furniture | 53% | scanner | furniture, bed, blanket |
| book-01.jpg | book | dog | 16% | scanner | dog, hot dog, rabbit |
| book-02.jpg | book | crayons | 34% | scanner | crayons, chopsticks, pencil |
| bowl-01.jpg | bowl | broccoli | 47% | auto | broccoli, spinach, carrot |
| bowl-02.jpg | bowl | food | 64% | auto | food, pasta, broccoli |
| bowl-04.jpg | bowl | soup | 61% | auto | soup, chopsticks, bowl |
| bowl-05.jpg | bowl | food | 54% | scanner | food, pie, honey |
| bowl-07.jpg | bowl | lemon | 42% | scanner | lemon, orange, banana |
| bowl-09.jpg | bowl | (not sure) | 12% | scanner |  |
| bowl-10.jpg | bowl | vegetable | 51% | scanner | vegetable, carrot, soup |
| bowl-12.jpg | bowl | food | 51% | scanner | food, pasta, soap |
| broccoli-01.jpg | broccoli | broccoli | 91% | auto | broccoli, cauliflower, cabbage |
| broccoli-03.jpg | broccoli | vegetable | 66% | auto | vegetable, broccoli, strawberry |
| cake-01.jpg | cake | food | 64% | scanner (blurry) | food, cake, diaper |
| cake-02.jpg | cake | cake | 91% | auto | cake, cupcake, flowers |
| cake-03.jpg | cake | cake | 72% | auto | cake, peas, cupcake |
| cake-05.jpg | cake | cake | 23% | scanner | cake, mop, cookie |
| cake-07.jpg | cake | food | 75% | auto | food, bread, bagel |
| carrot-01.jpg | carrot | carrot | 97% | auto | carrot, corn, sweet potato |
| carrot-02.jpg | carrot | carrot | 58% | auto | carrot, orange, sweet potato |
| carrot-03.jpg | carrot | carrot | 100% | auto | carrot, sweet potato, corn |
| cat-01.jpg | cat | cat | 46% | auto | cat, rabbit, squirrel |
| cat-02.jpg | cat | cat | 74% | auto | cat, rabbit, hamster |
| cat-03.jpg | cat | hat | 57% | auto | hat, hot dog, eye |
| cat-05.jpg | cat | animal | 76% | auto | animal, bird, squirrel |
| cat-07.jpg | cat | cat | 77% | auto | cat, rabbit, glass |
| cat-10.jpg | cat | cat | 99% | auto | cat, book, orange |
| cat-11.jpg | cat | cat | 99% | auto | cat, squirrel, rabbit |
| cat-12.jpg | cat | cat | 59% | auto | cat, squirrel, rabbit |
| chair-01.jpg | chair | ball | 15% | scanner | ball, drum, hammer |
| chair-02.jpg | chair | mirror | 77% | auto | mirror, chair, ladder |
| chair-04.jpg | chair | furniture | 56% | scanner | furniture, chair, glass |
| chair-05.jpg | chair | chair | 62% | auto | chair, recliner, seat belt |
| chair-07.jpg | chair | chair | 62% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | (not sure) | 6% | scanner |  |
| chair-10.jpg | chair | (not sure) | 10% | scanner |  |
| clock-01.jpg | clock | clock | 93% | auto | clock, lamp, watch |
| clock-03.jpg | clock | clock | 86% | auto | clock, watch, drum |
| clock-04.jpg | clock | clock | 93% | auto | clock, watch, kitchen timer |
| clock-05.jpg | clock | clock | 54% | auto | clock, thermometer, watch |
| cup-01.jpg | cup | cup | 60% | auto | cup, can, mug |
| cup-03.jpg | cup | drink | 80% | scanner (blurry) | drink, juice, glass |
| dog-01.jpg | dog | dog | 54% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 85% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 68% | auto | dog leash, dog, hot dog |
| dog-07.jpg | dog | dog | 74% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 76% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 81% | auto | dog, dog leash, hot dog |
| dog-11.jpg | dog | dog | 84% | auto | dog, dog leash, hot dog |
| dog-12.jpg | dog | animal | 65% | auto | animal, dog, sandals |
| donut-01.jpg | donut | food | 72% | auto | food, donut, bagel |
| donut-02.jpg | donut | donut | 62% | auto | donut, carrot, bagel |
| fork-01.jpg | fork | fork | 88% | auto | fork, spoon, chopsticks |
| fridge-01.jpg | fridge | fridge | 48% | auto | fridge, freezer, shelf |
| fridge-04.jpg | fridge | fridge | 77% | auto | fridge, freezer, door |
| fridge-05.jpg | fridge | (not sure) | 9% | scanner |  |
| fridge-06.jpg | fridge | fridge | 69% | auto | fridge, freezer, blender |
| fridge-08.jpg | fridge | fridge | 44% | scanner | fridge, freezer, uniform |
| fridge-09.jpg | fridge | fridge | 81% | auto | fridge, freezer, juice |
| fridge-10.jpg | fridge | fridge | 56% | auto | fridge, juice, freezer |
| fridge-12.jpg | fridge | chair | 18% | scanner | chair, fork, stool |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, keys |
| keyboard-03.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, piano |
| knife-01.jpg | knife | knife | 98% | auto | knife, ball, spatula |
| knife-03.jpg | knife | fork | 89% | auto | fork, spoon, spatula |
| laptop-02.jpg | laptop | laptop | 83% | auto | laptop, notebook, monitor |
| laptop-03.jpg | laptop | keyboard | 61% | auto | keyboard, laptop, desk |
| laptop-04.jpg | laptop | (not sure) | 2% | scanner |  |
| laptop-05.jpg | laptop | laptop | 61% | auto | laptop, desk, notebook |
| laptop-06.jpg | laptop | laptop | 46% | auto | laptop, keyboard, webcam |
| laptop-07.jpg | laptop | laptop | 53% | auto | laptop, keyboard, notebook |
| microwave-01.jpg | microwave | microwave | 76% | auto | microwave, honey, oven |
| microwave-02.jpg | microwave | microwave | 31% | scanner | microwave, radio, glass |
| orange-01.jpg | orange | fruit | 64% | auto | fruit, orange, apple |
| orange-02.jpg | orange | orange | 75% | auto | orange, lemon, pumpkin |
| oven-01.jpg | oven | oven | 17% | scanner | oven, bread, toaster |
| oven-02.jpg | oven | bread | 58% | auto | bread, bagel, pie |
| oven-04.jpg | oven | pizza | 70% | auto | pizza, pie, CD |
| oven-05.jpg | oven | rabbit | 19% | scanner | rabbit, cat, dog |
| oven-06.jpg | oven | oven | 21% | scanner | oven, stove, toaster |
| oven-07.jpg | oven | (not sure) | 9% | scanner |  |
| person-02.jpg | person | face | 14% | scanner (blurry) | face, head, mouth |
| person-04.jpg | person | (not sure) | 12% | scanner |  |
| person-05.jpg | person | clothes | 86% | auto | clothes, hat, tie |
| person-06.jpg | person | tie | 58% | auto | tie, suit, person |
| person-08.jpg | person | person | 68% | auto | person, mouth, spoon |
| person-09.jpg | person | child | 53% | auto | child, baby, corn |
| person-10.jpg | person | clothes | 52% | scanner | clothes, hat, mouth |
| person-12.jpg | person | clothes | 97% | auto | clothes, suit, skirt |
| phone-01.jpg | phone | radio | 15% | scanner | radio, camera, remote |
| phone-02.jpg | phone | car | 17% | scanner | car, razor, lighter |
| pizza-01.jpg | pizza | carrot | 19% | scanner | carrot, lettuce, peach |
| pizza-02.jpg | pizza | food | 59% | scanner | food, pie, pizza |
| pizza-07.jpg | pizza | pizza | 46% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | carrot | 17% | scanner | carrot, pie, glass |
| pizza-09.jpg | pizza | food | 80% | auto | food, pizza, glass |
| pizza-10.jpg | pizza | pizza | 52% | auto | pizza, pie, pancakes |
| pizza-11.jpg | pizza | honey | 13% | scanner | honey, orange, carrot |
| pizza-12.jpg | pizza | food | 56% | scanner | food, pie, pizza |
| plant-01.jpg | plant | flowers | 46% | auto | flowers, flower, orange |
| plant-03.jpg | plant | plant | 60% | auto | plant, Christmas tree, tree |
| plant-04.jpg | plant | fence | 13% | scanner | fence, gate, mirror |
| remote-01.jpg | remote | remote | 49% | auto | remote, dice, eraser |
| sandwich-01.jpg | sandwich | food | 67% | auto | food, sandwich, chicken |
| sandwich-02.jpg | sandwich | food | 83% | auto | food, bread, bagel |
| sandwich-04.jpg | sandwich | food | 86% | auto | food, hamburger, pie |
| sandwich-05.jpg | sandwich | carrot | 20% | scanner (blurry) | carrot, bread, orange |
| sandwich-06.jpg | sandwich | sandwich | 67% | auto | sandwich, cabbage, taco |
| sandwich-07.jpg | sandwich | hot dog | 52% | auto | hot dog, sausage, pie |
| sandwich-08.jpg | sandwich | food | 52% | scanner | food, carrot, hot dog |
| sandwich-12.jpg | sandwich | food | 75% | auto | food, sandwich, glass |
| scissors-01.jpg | scissors | scissors | 96% | auto | scissors, knife, pliers |
| sink-01.jpg | sink | sink | 86% | auto | sink, bathtub, bathroom sink |
| sink-03.jpg | sink | (not sure) | 5% | scanner |  |
| sink-04.jpg | sink | cat | 17% | scanner | cat, rabbit, hamster |
| sofa-01.jpg | sofa | cat | 20% | scanner | cat, dog, chair |
| sofa-03.jpg | sofa | plate | 17% | scanner | plate, fork, cup |
| sofa-04.jpg | sofa | cat | 95% | auto | cat, orange, lemon |
| sofa-05.jpg | sofa | furniture | 75% | auto | furniture, sofa, chair |
| sofa-06.jpg | sofa | sofa | 63% | auto | sofa, chair, cushion |
| sofa-07.jpg | sofa | sofa | 73% | auto | sofa, chair, cushion |
| sofa-08.jpg | sofa | sofa | 87% | auto | sofa, chair, cushion |
| sofa-10.jpg | sofa | sofa | 72% | auto | sofa, hammer, chair |
| sofa-11.jpg | sofa | sofa | 78% | auto | sofa, chair, cushion |
| spoon-01.jpg | spoon | spoon | 94% | auto | spoon, hammer, spatula |
| spoon-02.jpg | spoon | vegetable | 76% | auto | vegetable, spinach, green beans |
| suitcase-01.jpg | suitcase | suitcase | 51% | auto | suitcase, belt, seat belt |
| suitcase-02.jpg | suitcase | suitcase | 13% | scanner | suitcase, DVD, mailbox |
| suitcase-03.jpg | suitcase | (not sure) | 11% | scanner |  |
| suitcase-05.jpg | suitcase | suitcase | 78% | auto | suitcase, DVD, orange |
| teddy-bear-02.jpg | teddy bear | teddy bear | 68% | auto | teddy bear, toy, dog |
| teddy-bear-04.jpg | teddy bear | teddy bear | 93% | auto | teddy bear, toy, doll |
| teddy-bear-05.jpg | teddy bear | teddy bear | 75% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 97% | auto | teddy bear, honey, orange |
| toaster-01.jpg | toaster | toaster | 95% | auto | toaster, lighter, kettle |
| toothbrush-01.jpg | toothbrush | toothbrush | 98% | auto | toothbrush, carrot, toothpaste |
| tv-01.jpg | tv | clothes | 55% | scanner | clothes, hat, person |
| tv-04.jpg | tv | monitor | 73% | auto | monitor, apple, computer |
| tv-05.jpg | tv | monitor | 58% | auto | monitor, bill, computer |
| tv-06.jpg | tv | tv | 76% | auto | tv, hammer, monitor |
| tv-07.jpg | tv | monitor | 22% | scanner | monitor, tablet stand, computer |
| tv-08.jpg | tv | monitor | 63% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | electronics | 56% | scanner | electronics, monitor, ticket |
| umbrella-01.jpg | umbrella | umbrella | 92% | auto | umbrella, balloon, kite |
| umbrella-02.jpg | umbrella | umbrella | 97% | auto | umbrella, swimsuit, chair |
| umbrella-03.jpg | umbrella | umbrella | 86% | auto | umbrella, tent, kite |
| umbrella-06.jpg | umbrella | umbrella | 92% | auto | umbrella, tent, Christmas tree |
| umbrella-07.jpg | umbrella | umbrella | 92% | auto | umbrella, tent, orange |
| umbrella-10.jpg | umbrella | umbrella | 95% | auto | umbrella, tent, kite |
| umbrella-11.jpg | umbrella | umbrella | 98% | auto | umbrella, rain, coat |
| umbrella-12.jpg | umbrella | chopsticks | 21% | scanner | chopsticks, envelope, rolling pin |
| vase-01.jpg | vase | horse | 93% | auto | horse, drum, book |
| vase-02.jpg | vase | glass | 54% | auto | glass, orange, vase |
| vase-04.jpg | vase | vase | 52% | auto | vase, glass, flowers |
| vizwiz-apple-00689.jpg | apple | fruit | 61% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | pumpkin | 36% | scanner | pumpkin, carrot, soup |
| vizwiz-backpack-00499.jpg | backpack | clothes | 70% | auto | clothes, jacket, shirt |
| vizwiz-bed-00316.jpg | bed | furniture | 73% | auto | furniture, pillow, bed |
| vizwiz-beer-00319.jpg | beer | can | 66% | auto | can, soda, can opener |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-box-00401.jpg | box | box | 13% | scanner | box, package, envelope |
| vizwiz-box-01128.jpg | box | person | 50% | scanner | person, leg, foot |
| vizwiz-cake-01066.jpg | cake | (not sure) | 5% | scanner |  |
| vizwiz-can-00840.jpg | can | (not sure) | 8% | scanner |  |
| vizwiz-can-01184.jpg | can | (not sure) | 4% | scanner |  |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 8% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 56% | auto | chair, shower chair, stool |
| vizwiz-coffee-00561.jpg | coffee | jar | 12% | scanner | jar, lighter, glass |
| vizwiz-coffee-00937.jpg | coffee | mug | 48% | auto | mug, cup, travel mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 11% | scanner |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | electronics | 51% | scanner (blurry) | electronics, computer mouse, flashlight |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 15% | scanner | orange, carrot, soap |
| vizwiz-cookie-00772.jpg | cookie | (not sure) | 4% | scanner |  |
| vizwiz-corn-01008.jpg | corn | can | 25% | scanner | can, carrot, cup |
| vizwiz-crackers-00558.jpg | crackers | (not sure) | 12% | scanner |  |
| vizwiz-cup-00247.jpg | cup | cup | 70% | scanner (blurry) | cup, bucket, mug |
| vizwiz-cup-00857.jpg | cup | cup | 58% | auto | cup, mug, tea |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 5% | scanner |  |
| vizwiz-dog-00025.jpg | dog | dog | 16% | scanner | dog, coat, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 58% | auto | dog, hot dog, dog leash |
| vizwiz-door-00190.jpg | door | door | 17% | scanner (blurry) | door, door handle, shower |
| vizwiz-dresser-00569.jpg | dresser | drawer | 63% | auto | drawer, dresser, door handle |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 19% | scanner | coat rack, hanger, umbrella |
| vizwiz-finger-00182.jpg | finger | person | 59% | scanner | person, finger, leg |
| vizwiz-flower-00395.jpg | flower | flowers | 52% | auto | flowers, flower, carrot |
| vizwiz-foot-00080.jpg | foot | person | 55% | scanner | person, foot, shoes |
| vizwiz-foot-01040.jpg | foot | person | 53% | scanner (blurry) | person, foot, leg |
| vizwiz-glass-00808.jpg | glass | glass | 46% | scanner (blurry) | glass, jar, cup |
| vizwiz-glass-00952.jpg | glass | person | 72% | auto | person, foot, leg |
| vizwiz-hair-00530.jpg | hair | hair | 15% | scanner (blurry) | hair, head, mouth |
| vizwiz-heater-00502.jpg | heater | hand | 13% | scanner | hand, finger, leg |
| vizwiz-heater-01064.jpg | heater | radiator | 16% | scanner | radiator, heater, toaster |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 4% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 63% | scanner (blurry) | jar, peanut butter, honey |
| vizwiz-juice-00422.jpg | juice | juice | 24% | scanner | juice, juice box, orange |
| vizwiz-ketchup-00112.jpg | ketchup | (not sure) | 7% | scanner |  |
| vizwiz-ketchup-00220.jpg | ketchup | (not sure) | 9% | scanner |  |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 98% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00221.jpg | keyboard | finger | 43% | scanner | finger, hand, arm |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 19% | scanner | keyboard, piano, music keyboard |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 92% | auto | keyboard, music keyboard, piano |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 5% | scanner |  |
| vizwiz-lotion-00026.jpg | lotion | soap | 13% | scanner (blurry) | soap, lotion, flashlight |
| vizwiz-lotion-01072.jpg | lotion | candle | 14% | scanner | candle, soap, cup |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 6% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | mailbox | 12% | scanner | mailbox, envelope, DVD |
| vizwiz-medicine-00339.jpg | medicine | spoon | 14% | scanner | spoon, pen, knife |
| vizwiz-milk-00704.jpg | milk | drink | 51% | scanner (blurry) | drink, beer, glue |
| vizwiz-money-00473.jpg | money | money | 79% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 29% | scanner (blurry) | money, bill, flashlight |
| vizwiz-monitor-00663.jpg | monitor | (not sure) | 4% | scanner |  |
| vizwiz-mug-00104.jpg | mug | mug | 46% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 16% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 35% | scanner (blurry) | paper, bill, envelope |
| vizwiz-pear-00245.jpg | pear | pear | 47% | auto | pear, avocado, lemon |
| vizwiz-pen-00570.jpg | pen | pen | 22% | scanner | pen, marker, pencil |
| vizwiz-phone-00274.jpg | phone | phone | 43% | scanner (blurry) | phone, flashlight, camera |
| vizwiz-phone-00562.jpg | phone | phone | 63% | auto | phone, DVD, remote |
| vizwiz-phone-01124.jpg | phone | phone | 34% | scanner | phone, DVD, mirror |
| vizwiz-phone-01130.jpg | phone | phone | 50% | scanner (blurry) | phone, DVD, remote |
| vizwiz-picture-00559.jpg | picture | photo frame | 44% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | finger | 21% | scanner | finger, hand, lighter |
| vizwiz-pills-01113.jpg | pills | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 92% | auto | pumpkin, honey, orange |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 6% | scanner |  |
| vizwiz-radio-00642.jpg | radio | radio | 32% | scanner | radio, ticket, calculator |
| vizwiz-remote-00012.jpg | remote | remote | 98% | auto | remote, calculator, dice |
| vizwiz-remote-00387.jpg | remote | remote | 97% | auto | remote, game controller, flashlight |
| vizwiz-remote-00439.jpg | remote | remote | 93% | auto | remote, lighter, fork |
| vizwiz-scissors-00315.jpg | scissors | tool | 100% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | (not sure) | 5% | scanner |  |
| vizwiz-shampoo-00631.jpg | shampoo | shampoo | 24% | scanner | shampoo, soap, conditioner |
| vizwiz-shaving-cream-00244.jpg | shaving cream | (not sure) | 7% | scanner |  |
| vizwiz-shaving-cream-00733.jpg | shaving cream | shaving cream | 64% | auto | shaving cream, lighter, deodorant |
| vizwiz-shoes-00005.jpg | shoes | person | 62% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 58% | auto | sink, hammer, bathroom sink |
| vizwiz-soap-00460.jpg | soap | shirt | 48% | auto | shirt, blanket, coat |
| vizwiz-soda-01042.jpg | soda | beer | 27% | scanner (blurry) | beer, urinal bottle, soap |
| vizwiz-soda-01207.jpg | soda | flashlight | 24% | scanner (blurry) | flashlight, finger, hand |
| vizwiz-soup-00995.jpg | soup | soup | 29% | scanner | soup, can, carrot |
| vizwiz-spinach-01009.jpg | spinach | cup | 19% | scanner | cup, can, soup |
| vizwiz-spray-bottle-00364.jpg | spray bottle | (not sure) | 4% | scanner (blurry) |  |
| vizwiz-stairs-00699.jpg | stairs | stairs | 63% | auto | stairs, ladder, fence |
| vizwiz-stove-00678.jpg | stove | stove | 14% | scanner | stove, oven, bread |
| vizwiz-sugar-00134.jpg | sugar | juice | 5% | scanner | juice, juice box, soap |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 6% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 47% | scanner | tissues, juice, soap |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 91% | auto | toilet paper, paper, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 10% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 28% | scanner | flashlight, lamp, folder |
| vizwiz-water-00659.jpg | water | flashlight | 31% | scanner (blurry) | flashlight, straw, baby bottle |
| vizwiz-water-bottle-00049.jpg | water bottle | drink | 61% | auto | drink, water bottle, urinal bottle |
| vizwiz-wine-00669.jpg | wine | beer | 30% | scanner | beer, soap, honey |
| vizwiz-wine-00946.jpg | wine | (not sure) | 9% | scanner (blurry) |  |
| vizwiz-wine-01068.jpg | wine | flashlight | 19% | scanner | flashlight, beer, lamp |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 75% | auto | glass, wine glass, wine |
| vizwiz-yogurt-01051.jpg | yogurt | (not sure) | 4% | scanner |  |
| water-bottle-01.jpg | water bottle | lime | 15% | scanner | lime, urinal bottle, hand |
| wine-glass-02.jpg | wine glass | wine | 50% | auto | wine, glass, cup |

### test-images-public/dev-webcam, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 45% | 60% | 54% | 13% | 12% | 10% | 117 / 219 | 151 | vocab 248, none 29 |
| coco | 172 | 51% | 65% | 69% | 16% | 13% | 5% | 124 / 240 | 160 | vocab 163, none 9 |
| cluttered | 131 | 46% | 60% | 68% | 18% | 15% | 5% | 127 / 261 | 163 | vocab 125, none 6 |
| fruit | 12 | 50% | 83% | 75% | 8% | 42% | 0% | 135 / 261 | 171 | vocab 12 |
| webcam | 277 | 45% | 60% | 54% | 13% | 12% | 10% | 117 / 219 | 151 | vocab 248, none 29 |
| clothes & accessories | 11 | 73% | 73% | 82% | 0% | 9% | 0% | 92 / 181 | 125 | vocab 11 |
| table | 41 | 66% | 78% | 71% | 7% | 10% | 7% | 116 / 176 | 153 | vocab 38, none 3 |
| single | 41 | 66% | 78% | 71% | 7% | 10% | 7% | 116 / 176 | 153 | vocab 38, none 3 |
| furniture & home | 48 | 40% | 60% | 60% | 23% | 10% | 10% | 116 / 293 | 150 | none 5, vocab 43 |
| office & reading | 5 | 40% | 40% | 0% | 0% | 0% | 20% | 125 / 173 | 160 | vocab 4, none 1 |
| kitchen & dining | 46 | 50% | 57% | 54% | 22% | 0% | 11% | 126 / 240 | 162 | vocab 41, none 5 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 109 / 232 | 155 | vocab 7 |
| food & meals | 34 | 26% | 53% | 44% | 6% | 35% | 9% | 138 / 219 | 171 | vocab 31, none 3 |
| pets & animals | 18 | 83% | 100% | 94% | 6% | 11% | 0% | 100 / 221 | 139 | vocab 18 |
| electronics & media | 28 | 54% | 68% | 64% | 18% | 7% | 4% | 102 / 164 | 136 | vocab 27, none 1 |
| people & body | 12 | 17% | 50% | 50% | 33% | 33% | 8% | 118 / 162 | 147 | vocab 11, none 1 |
| personal items | 13 | 69% | 69% | 31% | 0% | 0% | 15% | 99 / 122 | 129 | vocab 11, none 2 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 81 / 113 | 112 | vocab 2, none 1 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 102 / 128 | 132 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 38% | 46% | 31% | 8% | 0% | 31% | 118 / 157 | 149 | vocab 9, none 4 |
| held | 105 | 37% | 52% | 30% | 10% | 10% | 19% | 105 / 157 | 135 | vocab 85, none 20 |
| vizwiz | 105 | 37% | 52% | 30% | 10% | 10% | 19% | 105 / 157 | 135 | vocab 85, none 20 |
| drinks | 16 | 19% | 19% | 13% | 13% | 6% | 19% | 122 / 182 | 152 | vocab 13, none 3 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 50% | 89 / 93 | 119 | vocab 1, none 1 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 112 / 112 | 141 | vocab 1 |
| health & medical | 3 | 0% | 0% | 0% | 0% | 0% | 33% | 124 / 156 | 154 | vocab 2, none 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 63% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 96% | scanner (blurry) | fruit, apple, pear |
| backpack-01.jpg | backpack | backpack | 91% | auto | backpack, jacket, purse |
| banana-01.jpg | banana | banana | 44% | scanner (blurry) | banana, face, person |
| banana-02.jpg | banana | banana | 89% | auto | banana, corn, lemon |
| banana-04.jpg | banana | banana | 56% | auto | banana, pear, mango |
| banana-05.jpg | banana | banana | 60% | auto | banana, Christmas tree, tree |
| banana-06.jpg | banana | fruit | 52% | scanner | fruit, banana, corn |
| bed-01.jpg | bed | (not sure) | 6% | scanner |  |
| bed-03.jpg | bed | chopsticks | 8% | scanner | chopsticks, pen, envelope |
| bed-04.jpg | bed | blanket | 58% | auto | blanket, coat, bedpan |
| bed-05.jpg | bed | bed | 47% | auto | bed, bedpan, mattress |
| bed-06.jpg | bed | curtains | 75% | auto | curtains, umbrella, tent |
| bed-09.jpg | bed | furniture | 72% | auto | furniture, blanket, sheets |
| bed-10.jpg | bed | bicycle | 93% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 51% | auto | blanket, sheets, bedpan |
| bed-12.jpg | bed | furniture | 53% | scanner | furniture, bed, blanket |
| book-01.jpg | book | dog | 16% | scanner | dog, hot dog, rabbit |
| book-02.jpg | book | crayons | 29% | scanner | crayons, chopsticks, pencil |
| bowl-01.jpg | bowl | broccoli | 50% | auto | broccoli, spinach, carrot |
| bowl-02.jpg | bowl | food | 59% | scanner | food, pasta, broccoli |
| bowl-04.jpg | bowl | soup | 61% | auto | soup, carrot, chopsticks |
| bowl-05.jpg | bowl | food | 54% | scanner | food, pie, honey |
| bowl-07.jpg | bowl | lemon | 42% | scanner | lemon, orange, banana |
| bowl-09.jpg | bowl | (not sure) | 12% | scanner |  |
| bowl-10.jpg | bowl | vegetable | 53% | scanner | vegetable, carrot, peas |
| bowl-12.jpg | bowl | food | 51% | scanner | food, pasta, soap |
| broccoli-01.jpg | broccoli | broccoli | 95% | auto | broccoli, cauliflower, cabbage |
| broccoli-03.jpg | broccoli | vegetable | 66% | auto | vegetable, broccoli, strawberry |
| cake-01.jpg | cake | food | 92% | scanner (blurry) | food, cake, hat |
| cake-02.jpg | cake | cake | 90% | auto | cake, cupcake, flowers |
| cake-03.jpg | cake | cake | 78% | auto | cake, peas, cupcake |
| cake-05.jpg | cake | cake | 23% | scanner | cake, mop, cookie |
| cake-07.jpg | cake | food | 80% | auto | food, bread, bagel |
| carrot-01.jpg | carrot | carrot | 93% | auto | carrot, corn, sweet potato |
| carrot-02.jpg | carrot | carrot | 93% | auto | carrot, orange, sweet potato |
| carrot-03.jpg | carrot | carrot | 100% | auto | carrot, sweet potato, corn |
| cat-01.jpg | cat | cat | 49% | auto | cat, rabbit, squirrel |
| cat-02.jpg | cat | cat | 84% | auto | cat, rabbit, orange |
| cat-03.jpg | cat | cat | 76% | auto | cat, eye, hat |
| cat-05.jpg | cat | animal | 76% | auto | animal, bird, cat |
| cat-07.jpg | cat | cat | 79% | auto | cat, rabbit, dog |
| cat-10.jpg | cat | cat | 99% | auto | cat, book, orange |
| cat-11.jpg | cat | cat | 99% | auto | cat, squirrel, rabbit |
| cat-12.jpg | cat | cat | 79% | auto | cat, squirrel, rabbit |
| chair-01.jpg | chair | chair | 21% | scanner | chair, ball, stool |
| chair-02.jpg | chair | mirror | 88% | auto | mirror, chair, photo frame |
| chair-04.jpg | chair | furniture | 56% | scanner | furniture, chair, glass |
| chair-05.jpg | chair | chair | 52% | auto | chair, recliner, seat belt |
| chair-07.jpg | chair | chair | 69% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | (not sure) | 12% | scanner |  |
| chair-10.jpg | chair | (not sure) | 8% | scanner |  |
| clock-01.jpg | clock | clock | 93% | auto | clock, honey, watch |
| clock-03.jpg | clock | clock | 70% | auto | clock, watch, fork |
| clock-04.jpg | clock | clock | 91% | auto | clock, watch, kitchen timer |
| clock-05.jpg | clock | clock | 60% | auto | clock, watch, thermometer |
| cup-01.jpg | cup | cup | 60% | auto | cup, can, mug |
| cup-03.jpg | cup | drink | 62% | scanner (blurry) | drink, juice, glass |
| dog-01.jpg | dog | dog | 64% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 85% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 81% | auto | dog leash, dog, hot dog |
| dog-07.jpg | dog | dog | 76% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 73% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 84% | auto | dog, hot dog, dog leash |
| dog-11.jpg | dog | dog | 71% | auto | dog, hot dog, dog leash |
| dog-12.jpg | dog | animal | 65% | auto | animal, dog, sandals |
| donut-01.jpg | donut | food | 72% | auto | food, donut, bagel |
| donut-02.jpg | donut | donut | 62% | auto | donut, carrot, bagel |
| fork-01.jpg | fork | fork | 89% | auto | fork, spoon, chopsticks |
| fridge-01.jpg | fridge | fridge | 54% | auto | fridge, freezer, shelf |
| fridge-04.jpg | fridge | fridge | 77% | auto | fridge, freezer, door |
| fridge-05.jpg | fridge | fridge | 24% | scanner | fridge, freezer, door |
| fridge-06.jpg | fridge | fridge | 69% | auto | fridge, freezer, blender |
| fridge-08.jpg | fridge | fridge | 44% | scanner | fridge, freezer, uniform |
| fridge-09.jpg | fridge | fridge | 81% | auto | fridge, freezer, juice |
| fridge-10.jpg | fridge | fridge | 56% | auto | fridge, freezer, juice |
| fridge-12.jpg | fridge | chair | 18% | scanner | chair, fork, stool |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, computer mouse |
| keyboard-03.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, computer mouse |
| knife-01.jpg | knife | knife | 98% | auto | knife, hammer, spatula |
| knife-03.jpg | knife | fork | 91% | auto | fork, spoon, spatula |
| laptop-02.jpg | laptop | keyboard | 59% | auto | keyboard, laptop, monitor |
| laptop-03.jpg | laptop | laptop | 76% | auto | laptop, envelope, notebook |
| laptop-04.jpg | laptop | phone charger | 13% | scanner | phone charger, charging cable, laptop |
| laptop-05.jpg | laptop | laptop | 61% | auto | laptop, desk, notebook |
| laptop-06.jpg | laptop | laptop | 51% | auto | laptop, monitor, keyboard |
| laptop-07.jpg | laptop | laptop | 53% | auto | laptop, keyboard, notebook |
| microwave-01.jpg | microwave | microwave | 76% | auto | microwave, honey, oven |
| microwave-02.jpg | microwave | microwave | 31% | scanner | microwave, radio, glass |
| orange-01.jpg | orange | fruit | 66% | auto | fruit, orange, apple |
| orange-02.jpg | orange | orange | 78% | auto | orange, lemon, carrot |
| oven-01.jpg | oven | oven | 17% | scanner | oven, bread, toaster |
| oven-02.jpg | oven | bread | 69% | auto | bread, bagel, soup |
| oven-04.jpg | oven | pizza | 63% | auto | pizza, pie, pancakes |
| oven-05.jpg | oven | rabbit | 19% | scanner | rabbit, cat, dog |
| oven-06.jpg | oven | stove | 50% | auto | stove, oven, toaster |
| oven-07.jpg | oven | (not sure) | 6% | scanner |  |
| person-02.jpg | person | face | 14% | scanner (blurry) | face, head, mouth |
| person-04.jpg | person | (not sure) | 12% | scanner |  |
| person-05.jpg | person | clothes | 86% | auto | clothes, hat, tie |
| person-06.jpg | person | tie | 48% | auto | tie, person, face |
| person-08.jpg | person | person | 65% | auto | person, mouth, spoon |
| person-09.jpg | person | child | 67% | auto | child, baby, corn |
| person-10.jpg | person | clothes | 52% | scanner | clothes, hat, mouth |
| person-12.jpg | person | clothes | 88% | auto | clothes, skirt, suit |
| phone-01.jpg | phone | radio | 15% | scanner | radio, camera, remote |
| phone-02.jpg | phone | car | 17% | scanner | car, razor, lighter |
| pizza-01.jpg | pizza | carrot | 12% | scanner | carrot, lettuce, pie |
| pizza-02.jpg | pizza | food | 59% | scanner | food, pie, pizza |
| pizza-07.jpg | pizza | pizza | 46% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | pie | 13% | scanner | pie, bacon, glass |
| pizza-09.jpg | pizza | food | 83% | auto | food, pizza, pie |
| pizza-10.jpg | pizza | pizza | 54% | auto | pizza, pie, pasta |
| pizza-11.jpg | pizza | honey | 15% | scanner | honey, orange, bread |
| pizza-12.jpg | pizza | food | 52% | scanner | food, pie, carrot |
| plant-01.jpg | plant | flowers | 60% | auto | flowers, flower, orange |
| plant-03.jpg | plant | Christmas tree | 46% | auto | Christmas tree, tree, plant |
| plant-04.jpg | plant | fence | 12% | scanner | fence, chopsticks, Christmas tree |
| remote-01.jpg | remote | remote | 49% | auto | remote, eraser, knife |
| sandwich-01.jpg | sandwich | food | 67% | auto | food, sandwich, carrot |
| sandwich-02.jpg | sandwich | food | 55% | scanner | food, bread, bagel |
| sandwich-04.jpg | sandwich | food | 86% | auto | food, hamburger, bagel |
| sandwich-05.jpg | sandwich | food | 64% | scanner (blurry) | food, bread, carrot |
| sandwich-06.jpg | sandwich | sandwich | 67% | auto | sandwich, cabbage, taco |
| sandwich-07.jpg | sandwich | hot dog | 52% | auto | hot dog, sausage, pie |
| sandwich-08.jpg | sandwich | carrot | 19% | scanner | carrot, hot dog, taco |
| sandwich-12.jpg | sandwich | food | 77% | auto | food, sandwich, bagel |
| scissors-01.jpg | scissors | scissors | 91% | auto | scissors, knife, pliers |
| sink-01.jpg | sink | sink | 86% | auto | sink, cup, bathroom sink |
| sink-03.jpg | sink | (not sure) | 4% | scanner |  |
| sink-04.jpg | sink | (not sure) | 3% | scanner |  |
| sofa-01.jpg | sofa | cat | 20% | scanner | cat, dog, chair |
| sofa-03.jpg | sofa | plate | 12% | scanner | plate, pasta, cup |
| sofa-04.jpg | sofa | cat | 88% | auto | cat, orange, spoon |
| sofa-05.jpg | sofa | furniture | 75% | auto | furniture, sofa, chair |
| sofa-06.jpg | sofa | sofa | 63% | auto | sofa, chair, cushion |
| sofa-07.jpg | sofa | sofa | 64% | auto | sofa, chair, cushion |
| sofa-08.jpg | sofa | sofa | 86% | auto | sofa, chair, cushion |
| sofa-10.jpg | sofa | sofa | 72% | auto | sofa, corn, chair |
| sofa-11.jpg | sofa | sofa | 78% | auto | sofa, chair, cushion |
| spoon-01.jpg | spoon | spoon | 94% | auto | spoon, hammer, spatula |
| spoon-02.jpg | spoon | vegetable | 76% | auto | vegetable, spinach, green beans |
| suitcase-01.jpg | suitcase | suitcase | 51% | auto | suitcase, colander, seat belt |
| suitcase-02.jpg | suitcase | suitcase | 13% | scanner | suitcase, DVD, mailbox |
| suitcase-03.jpg | suitcase | (not sure) | 11% | scanner |  |
| suitcase-05.jpg | suitcase | suitcase | 66% | auto | suitcase, DVD, orange |
| teddy-bear-02.jpg | teddy bear | teddy bear | 68% | auto | teddy bear, toy, dog |
| teddy-bear-04.jpg | teddy bear | teddy bear | 93% | auto | teddy bear, toy, doll |
| teddy-bear-05.jpg | teddy bear | teddy bear | 75% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 97% | auto | teddy bear, honey, toy |
| toaster-01.jpg | toaster | toaster | 95% | auto | toaster, knife, kettle |
| toothbrush-01.jpg | toothbrush | toothbrush | 98% | auto | toothbrush, carrot, toothpaste |
| tv-01.jpg | tv | clothes | 58% | scanner | clothes, hat, coat |
| tv-04.jpg | tv | monitor | 73% | auto | monitor, apple, computer |
| tv-05.jpg | tv | monitor | 58% | auto | monitor, paper, computer |
| tv-06.jpg | tv | tv | 76% | auto | tv, hammer, monitor |
| tv-07.jpg | tv | monitor | 22% | scanner | monitor, computer, tablet stand |
| tv-08.jpg | tv | monitor | 63% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | electronics | 56% | scanner | electronics, monitor, ticket |
| umbrella-01.jpg | umbrella | umbrella | 80% | auto | umbrella, balloon, ball |
| umbrella-02.jpg | umbrella | umbrella | 77% | auto | umbrella, kite, swimsuit |
| umbrella-03.jpg | umbrella | umbrella | 76% | auto | umbrella, kite, tent |
| umbrella-06.jpg | umbrella | umbrella | 92% | auto | umbrella, tent, Christmas tree |
| umbrella-07.jpg | umbrella | umbrella | 92% | auto | umbrella, tent, orange |
| umbrella-10.jpg | umbrella | umbrella | 98% | auto | umbrella, tent, kite |
| umbrella-11.jpg | umbrella | umbrella | 98% | auto | umbrella, rain, coat |
| umbrella-12.jpg | umbrella | chopsticks | 12% | scanner | chopsticks, envelope, rolling pin |
| vase-01.jpg | vase | horse | 93% | auto | horse, book, drum |
| vase-02.jpg | vase | glass | 54% | auto | glass, orange, vase |
| vase-04.jpg | vase | vase | 52% | auto | vase, glass, flowers |
| vizwiz-apple-00689.jpg | apple | fruit | 61% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | pumpkin | 36% | scanner | pumpkin, carrot, soup |
| vizwiz-backpack-00499.jpg | backpack | clothes | 70% | auto | clothes, jacket, shirt |
| vizwiz-bed-00316.jpg | bed | furniture | 73% | auto | furniture, pillow, bed |
| vizwiz-beer-00319.jpg | beer | can | 66% | auto | can, soda, can opener |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-box-00401.jpg | box | box | 13% | scanner | box, package, envelope |
| vizwiz-box-01128.jpg | box | person | 50% | scanner | person, leg, foot |
| vizwiz-cake-01066.jpg | cake | (not sure) | 5% | scanner |  |
| vizwiz-can-00840.jpg | can | (not sure) | 8% | scanner |  |
| vizwiz-can-01184.jpg | can | can | 16% | scanner | can, book, cup |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 8% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 56% | auto | chair, shower chair, stool |
| vizwiz-coffee-00561.jpg | coffee | jar | 21% | scanner | jar, glass, honey |
| vizwiz-coffee-00937.jpg | coffee | mug | 48% | auto | mug, cup, travel mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 11% | scanner |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | electronics | 51% | scanner (blurry) | electronics, computer mouse, flashlight |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 15% | scanner | orange, carrot, soap |
| vizwiz-cookie-00772.jpg | cookie | food | 63% | auto | food, cookie, bread |
| vizwiz-corn-01008.jpg | corn | can | 25% | scanner | can, carrot, cup |
| vizwiz-crackers-00558.jpg | crackers | person | 62% | auto | person, hand, finger |
| vizwiz-cup-00247.jpg | cup | cup | 70% | scanner (blurry) | cup, bucket, mug |
| vizwiz-cup-00857.jpg | cup | mug | 55% | auto | mug, cup, tea |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 5% | scanner |  |
| vizwiz-dog-00025.jpg | dog | dog | 16% | scanner | dog, coat, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 58% | auto | dog, hot dog, dog leash |
| vizwiz-door-00190.jpg | door | door | 17% | scanner (blurry) | door, door handle, shower |
| vizwiz-dresser-00569.jpg | dresser | drawer | 67% | auto | drawer, door handle, dresser |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 19% | scanner | coat rack, hanger, umbrella |
| vizwiz-finger-00182.jpg | finger | person | 82% | auto | person, finger, hand |
| vizwiz-flower-00395.jpg | flower | flowers | 51% | auto | flowers, flower, flower pot |
| vizwiz-foot-00080.jpg | foot | person | 55% | scanner | person, foot, leg |
| vizwiz-foot-01040.jpg | foot | person | 53% | scanner (blurry) | person, foot, leg |
| vizwiz-glass-00808.jpg | glass | glass | 45% | scanner (blurry) | glass, jar, cup |
| vizwiz-glass-00952.jpg | glass | person | 72% | auto | person, foot, leg |
| vizwiz-hair-00530.jpg | hair | hair | 15% | scanner (blurry) | hair, head, mouth |
| vizwiz-heater-00502.jpg | heater | cabinet | 14% | scanner | cabinet, hand, dresser |
| vizwiz-heater-01064.jpg | heater | radiator | 16% | scanner | radiator, heater, toaster |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 4% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 63% | scanner (blurry) | jar, peanut butter, honey |
| vizwiz-juice-00422.jpg | juice | juice | 24% | scanner | juice, juice box, orange |
| vizwiz-ketchup-00112.jpg | ketchup | ketchup | 26% | scanner | ketchup, soap, tomato |
| vizwiz-ketchup-00220.jpg | ketchup | beer | 13% | scanner | beer, ketchup, carrot |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 60% | auto | keyboard, dice, keys |
| vizwiz-keyboard-00221.jpg | keyboard | finger | 43% | scanner | finger, hand, arm |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 19% | scanner | keyboard, piano, music keyboard |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 92% | auto | keyboard, music keyboard, piano |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 5% | scanner |  |
| vizwiz-lotion-00026.jpg | lotion | soap | 13% | scanner (blurry) | soap, lotion, flashlight |
| vizwiz-lotion-01072.jpg | lotion | cup | 35% | scanner | cup, candle, mug |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 6% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | mailbox | 12% | scanner | mailbox, envelope, DVD |
| vizwiz-medicine-00339.jpg | medicine | spoon | 14% | scanner | spoon, pen, knife |
| vizwiz-milk-00704.jpg | milk | drink | 51% | scanner (blurry) | drink, beer, glue |
| vizwiz-money-00473.jpg | money | money | 79% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 29% | scanner (blurry) | money, bill, flashlight |
| vizwiz-monitor-00663.jpg | monitor | (not sure) | 4% | scanner |  |
| vizwiz-mug-00104.jpg | mug | mug | 46% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 16% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 35% | scanner (blurry) | paper, bill, envelope |
| vizwiz-pear-00245.jpg | pear | fruit | 83% | auto | fruit, pear, lime |
| vizwiz-pen-00570.jpg | pen | pen | 22% | scanner | pen, marker, pencil |
| vizwiz-phone-00274.jpg | phone | phone | 43% | scanner (blurry) | phone, flashlight, lighter |
| vizwiz-phone-00562.jpg | phone | phone | 69% | auto | phone, DVD, remote |
| vizwiz-phone-01124.jpg | phone | phone | 34% | scanner | phone, DVD, mirror |
| vizwiz-phone-01130.jpg | phone | phone | 50% | scanner (blurry) | phone, DVD, remote |
| vizwiz-picture-00559.jpg | picture | photo frame | 30% | scanner | photo frame, book, picture |
| vizwiz-pill-bottle-00089.jpg | pill bottle | lime | 20% | scanner | lime, finger, lighter |
| vizwiz-pills-01113.jpg | pills | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 92% | auto | pumpkin, honey, orange |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 6% | scanner |  |
| vizwiz-radio-00642.jpg | radio | radio | 32% | scanner | radio, ticket, calculator |
| vizwiz-remote-00012.jpg | remote | remote | 98% | auto | remote, calculator, dice |
| vizwiz-remote-00387.jpg | remote | remote | 97% | auto | remote, game controller, flashlight |
| vizwiz-remote-00439.jpg | remote | remote | 94% | auto | remote, spatula, knife |
| vizwiz-scissors-00315.jpg | scissors | tool | 100% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | (not sure) | 5% | scanner |  |
| vizwiz-shampoo-00631.jpg | shampoo | shampoo | 24% | scanner | shampoo, soap, conditioner |
| vizwiz-shaving-cream-00244.jpg | shaving cream | (not sure) | 7% | scanner |  |
| vizwiz-shaving-cream-00733.jpg | shaving cream | shaving cream | 64% | auto | shaving cream, lighter, deodorant |
| vizwiz-shoes-00005.jpg | shoes | person | 62% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 58% | auto | sink, hammer, bathroom sink |
| vizwiz-soap-00460.jpg | soap | shirt | 48% | auto | shirt, blanket, coat |
| vizwiz-soda-01042.jpg | soda | beer | 27% | scanner (blurry) | beer, flashlight, urinal bottle |
| vizwiz-soda-01207.jpg | soda | flashlight | 24% | scanner (blurry) | flashlight, finger, hand |
| vizwiz-soup-00995.jpg | soup | soup | 29% | scanner | soup, can, carrot |
| vizwiz-spinach-01009.jpg | spinach | cup | 19% | scanner | cup, can, soup |
| vizwiz-spray-bottle-00364.jpg | spray bottle | (not sure) | 4% | scanner (blurry) |  |
| vizwiz-stairs-00699.jpg | stairs | stairs | 63% | auto | stairs, ladder, fence |
| vizwiz-stove-00678.jpg | stove | stove | 14% | scanner | stove, oven, bread |
| vizwiz-sugar-00134.jpg | sugar | juice | 5% | scanner | juice, juice box, soap |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 6% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 47% | scanner | tissues, juice, soap |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 91% | auto | toilet paper, paper, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 10% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 28% | scanner | flashlight, lamp, folder |
| vizwiz-water-00659.jpg | water | flashlight | 31% | scanner (blurry) | flashlight, straw, baby bottle |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 21% | scanner | water bottle, urinal bottle, baby bottle |
| vizwiz-wine-00669.jpg | wine | beer | 30% | scanner | beer, honey, urinal bottle |
| vizwiz-wine-00946.jpg | wine | (not sure) | 9% | scanner (blurry) |  |
| vizwiz-wine-01068.jpg | wine | flashlight | 19% | scanner | flashlight, beer, lamp |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 75% | auto | glass, wine glass, wine |
| vizwiz-yogurt-01051.jpg | yogurt | (not sure) | 4% | scanner |  |
| water-bottle-01.jpg | water bottle | lime | 15% | scanner | lime, urinal bottle, hand |
| wine-glass-02.jpg | wine glass | wine | 50% | auto | wine, glass, cup |

### test-images-public/dev-phone, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 40% | 55% | 52% | 13% | 13% | 10% | 225 / 425 | 305 | vocab 248, none 29 |
| coco | 172 | 47% | 63% | 67% | 17% | 15% | 6% | 231 / 452 | 320 | vocab 162, none 10 |
| cluttered | 131 | 41% | 58% | 67% | 20% | 16% | 5% | 235 / 455 | 327 | vocab 124, none 7 |
| fruit | 12 | 42% | 75% | 67% | 8% | 42% | 0% | 215 / 452 | 331 | vocab 12 |
| phone | 277 | 40% | 55% | 52% | 13% | 13% | 10% | 225 / 425 | 305 | vocab 248, none 29 |
| clothes & accessories | 11 | 73% | 73% | 73% | 0% | 0% | 0% | 164 / 301 | 259 | vocab 11 |
| table | 41 | 66% | 78% | 68% | 7% | 10% | 7% | 218 / 411 | 300 | vocab 38, none 3 |
| single | 41 | 66% | 78% | 68% | 7% | 10% | 7% | 218 / 411 | 300 | vocab 38, none 3 |
| furniture & home | 48 | 35% | 56% | 60% | 19% | 15% | 19% | 201 / 452 | 287 | none 9, vocab 39 |
| office & reading | 5 | 20% | 40% | 0% | 0% | 0% | 40% | 171 / 244 | 237 | vocab 3, none 2 |
| kitchen & dining | 46 | 50% | 54% | 54% | 24% | 0% | 4% | 233 / 403 | 307 | vocab 44, none 2 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 131 / 238 | 214 | vocab 7 |
| food & meals | 34 | 21% | 38% | 41% | 0% | 29% | 15% | 289 / 462 | 373 | vocab 29, none 5 |
| pets & animals | 18 | 83% | 94% | 94% | 6% | 11% | 0% | 182 / 378 | 266 | vocab 18 |
| electronics & media | 28 | 43% | 68% | 61% | 21% | 14% | 4% | 197 / 461 | 272 | vocab 27, none 1 |
| people & body | 12 | 8% | 50% | 67% | 42% | 42% | 8% | 303 / 455 | 384 | vocab 11, none 1 |
| personal items | 13 | 54% | 69% | 23% | 0% | 0% | 23% | 245 / 332 | 316 | none 3, vocab 10 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 153 / 227 | 207 | vocab 2, none 1 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 211 / 301 | 287 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 23% | 23% | 15% | 0% | 0% | 15% | 217 / 304 | 278 | vocab 11, none 2 |
| held | 105 | 29% | 43% | 27% | 6% | 10% | 18% | 217 / 338 | 280 | vocab 86, none 19 |
| vizwiz | 105 | 29% | 43% | 27% | 6% | 10% | 18% | 217 / 338 | 280 | vocab 86, none 19 |
| drinks | 16 | 13% | 19% | 6% | 6% | 6% | 13% | 288 / 362 | 355 | vocab 14, none 2 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 0% | 233 / 298 | 295 | vocab 2 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 292 / 292 | 353 | vocab 1 |
| health & medical | 3 | 0% | 0% | 33% | 33% | 0% | 0% | 264 / 317 | 323 | vocab 3 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 83% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 93% | scanner (blurry) | fruit, apple, pear |
| backpack-01.jpg | backpack | backpack | 84% | auto | backpack, book, purse |
| banana-01.jpg | banana | face | 10% | scanner (blurry) | face, head, person |
| banana-02.jpg | banana | banana | 84% | auto | banana, corn, lemon |
| banana-04.jpg | banana | banana | 82% | auto | banana, mango, pear |
| banana-05.jpg | banana | banana | 89% | auto | banana, cucumber, lime |
| banana-06.jpg | banana | fruit | 56% | scanner (blurry) | fruit, banana, pear |
| bed-01.jpg | bed | (not sure) | 9% | scanner |  |
| bed-03.jpg | bed | (not sure) | 9% | scanner |  |
| bed-04.jpg | bed | blanket | 65% | auto | blanket, sheets, bed |
| bed-05.jpg | bed | bed | 45% | auto | bed, mattress, sheets |
| bed-06.jpg | bed | curtains | 83% | auto | curtains, shower, window |
| bed-09.jpg | bed | furniture | 73% | auto | furniture, blanket, rope |
| bed-10.jpg | bed | bicycle | 78% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 45% | auto | blanket, sheets, bedpan |
| bed-12.jpg | bed | furniture | 55% | scanner | furniture, bed, blanket |
| book-01.jpg | book | dog | 22% | scanner | dog, hot dog, book |
| book-02.jpg | book | crayons | 39% | scanner | crayons, chopsticks, paint |
| bowl-01.jpg | bowl | broccoli | 69% | auto | broccoli, spinach, peas |
| bowl-02.jpg | bowl | pasta | 60% | auto | pasta, broccoli, noodles |
| bowl-04.jpg | bowl | soup | 61% | auto | soup, chopsticks, bowl |
| bowl-05.jpg | bowl | food | 61% | auto | food, pie, sweet potato |
| bowl-07.jpg | bowl | lemon | 32% | scanner | lemon, orange, banana |
| bowl-09.jpg | bowl | plate | 16% | scanner | plate, carrot, soup |
| bowl-10.jpg | bowl | vegetable | 73% | auto | vegetable, carrot, tomato |
| bowl-12.jpg | bowl | soup | 14% | scanner | soup, pasta, watermelon |
| broccoli-01.jpg | broccoli | broccoli | 48% | auto | broccoli, cauliflower, cabbage |
| broccoli-03.jpg | broccoli | vegetable | 71% | auto | vegetable, broccoli, peas |
| cake-01.jpg | cake | food | 92% | scanner (blurry) | food, cake, cupcake |
| cake-02.jpg | cake | cake | 60% | auto | cake, cupcake, flowers |
| cake-03.jpg | cake | cake | 72% | auto | cake, peas, rosary |
| cake-05.jpg | cake | food | 62% | auto | food, cake, cookie |
| cake-07.jpg | cake | food | 73% | auto | food, bread, bagel |
| carrot-01.jpg | carrot | carrot | 88% | auto | carrot, corn, sweet potato |
| carrot-02.jpg | carrot | carrot | 75% | auto | carrot, orange, sweet potato |
| carrot-03.jpg | carrot | carrot | 99% | auto | carrot, sweet potato, orange |
| cat-01.jpg | cat | cat | 98% | auto | cat, rabbit, book |
| cat-02.jpg | cat | cat | 90% | auto | cat, orange, rabbit |
| cat-03.jpg | cat | cat | 73% | auto | cat, hat, orange |
| cat-05.jpg | cat | animal | 74% | auto | animal, rabbit, squirrel |
| cat-07.jpg | cat | cat | 85% | auto | cat, glass, cup |
| cat-10.jpg | cat | cat | 99% | auto | cat, squirrel, book |
| cat-11.jpg | cat | cat | 98% | auto | cat, eye, rabbit |
| cat-12.jpg | cat | cat | 67% | auto | cat, rabbit, squirrel |
| chair-01.jpg | chair | chair | 24% | scanner | chair, ball, stool |
| chair-02.jpg | chair | mirror | 78% | auto | mirror, chair, ladder |
| chair-04.jpg | chair | furniture | 52% | scanner | furniture, chair, glass |
| chair-05.jpg | chair | chair | 56% | auto | chair, recliner, shower chair |
| chair-07.jpg | chair | chair | 68% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | paper clip | 18% | scanner | paper clip, paper, notebook |
| chair-10.jpg | chair | (not sure) | 5% | scanner |  |
| clock-01.jpg | clock | clock | 80% | auto | clock, honey, watch |
| clock-03.jpg | clock | clock | 49% | auto | clock, watch, fork |
| clock-04.jpg | clock | clock | 92% | auto | clock, watch, kitchen timer |
| clock-05.jpg | clock | clock | 56% | auto | clock, alarm clock, thermometer |
| cup-01.jpg | cup | cup | 67% | auto | cup, can, mug |
| cup-03.jpg | cup | drink | 79% | scanner (blurry) | drink, juice, orange |
| dog-01.jpg | dog | dog | 58% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 86% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 69% | auto | dog leash, dog, hot dog |
| dog-07.jpg | dog | dog | 75% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 73% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 86% | auto | dog, hot dog, dog leash |
| dog-11.jpg | dog | dog | 69% | auto | dog, hot dog, dog leash |
| dog-12.jpg | dog | animal | 65% | auto | animal, dog, dog leash |
| donut-01.jpg | donut | food | 73% | auto | food, donut, candy |
| donut-02.jpg | donut | donut | 49% | auto | donut, carrot, bagel |
| fork-01.jpg | fork | fork | 97% | auto | fork, peas, spoon |
| fridge-01.jpg | fridge | fridge | 64% | auto | fridge, freezer, shelf |
| fridge-04.jpg | fridge | fridge | 77% | auto | fridge, chopsticks, freezer |
| fridge-05.jpg | fridge | fridge | 19% | scanner | fridge, chopsticks, door |
| fridge-06.jpg | fridge | fridge | 76% | auto | fridge, freezer, blender |
| fridge-08.jpg | fridge | fridge | 42% | scanner | fridge, mirror, uniform |
| fridge-09.jpg | fridge | fridge | 58% | auto | fridge, door, freezer |
| fridge-10.jpg | fridge | (not sure) | 3% | scanner |  |
| fridge-12.jpg | fridge | finger | 16% | scanner | finger, hand, paper |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, computer mouse |
| keyboard-03.jpg | keyboard | keyboard | 53% | auto | keyboard, piano, computer mouse |
| knife-01.jpg | knife | knife | 96% | auto | knife, ticket, spatula |
| knife-03.jpg | knife | fork | 84% | auto | fork, spoon, spatula |
| laptop-02.jpg | laptop | keyboard | 45% | auto | keyboard, laptop, monitor |
| laptop-03.jpg | laptop | keyboard | 45% | auto | keyboard, piano, laptop |
| laptop-04.jpg | laptop | (not sure) | 3% | scanner |  |
| laptop-05.jpg | laptop | laptop | 52% | auto | laptop, chair, desk |
| laptop-06.jpg | laptop | keyboard | 45% | auto | keyboard, laptop, webcam |
| laptop-07.jpg | laptop | electronics | 51% | scanner | electronics, laptop, keyboard |
| microwave-01.jpg | microwave | microwave | 67% | auto | microwave, honey, oven |
| microwave-02.jpg | microwave | microwave | 43% | scanner | microwave, radio, toaster |
| orange-01.jpg | orange | fruit | 85% | auto | fruit, orange, apple |
| orange-02.jpg | orange | orange | 46% | auto | orange, carrot, pumpkin |
| oven-01.jpg | oven | oven | 15% | scanner | oven, bread, baking tray |
| oven-02.jpg | oven | bread | 55% | auto | bread, bagel, pie |
| oven-04.jpg | oven | pizza | 59% | auto | pizza, pie, pancakes |
| oven-05.jpg | oven | rabbit | 19% | scanner | rabbit, dog, cat |
| oven-06.jpg | oven | stove | 13% | scanner | stove, oven, fridge |
| oven-07.jpg | oven | fridge | 5% | scanner | fridge, lighter, door |
| person-02.jpg | person | bandage | 14% | scanner | bandage, face, head |
| person-04.jpg | person | (not sure) | 7% | scanner |  |
| person-05.jpg | person | clothes | 80% | auto | clothes, hat, face |
| person-06.jpg | person | tie | 45% | auto | tie, suit, person |
| person-08.jpg | person | person | 72% | auto | person, mouth, toothbrush |
| person-09.jpg | person | child | 51% | auto | child, baby, corn |
| person-10.jpg | person | hat | 52% | auto | hat, teeth, book |
| person-12.jpg | person | skirt | 62% | auto | skirt, tie, uniform |
| phone-01.jpg | phone | (not sure) | 11% | scanner |  |
| phone-02.jpg | phone | car | 30% | scanner | car, taxi, book |
| pizza-01.jpg | pizza | carrot | 24% | scanner | carrot, pie, lettuce |
| pizza-02.jpg | pizza | carrot | 12% | scanner | carrot, peach, lettuce |
| pizza-07.jpg | pizza | pizza | 68% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | carrot | 17% | scanner | carrot, pie, plate |
| pizza-09.jpg | pizza | food | 78% | auto | food, pizza, glass |
| pizza-10.jpg | pizza | pizza | 63% | auto | pizza, pie, pancakes |
| pizza-11.jpg | pizza | mushroom | 23% | scanner | mushroom, carrot, plate |
| pizza-12.jpg | pizza | carrot | 13% | scanner | carrot, orange, bread |
| plant-01.jpg | plant | flowers | 43% | scanner | flowers, flower, vase |
| plant-03.jpg | plant | plant | 47% | auto | plant, Christmas tree, tree |
| plant-04.jpg | plant | (not sure) | 7% | scanner |  |
| remote-01.jpg | remote | remote | 49% | auto | remote, eraser, knife |
| sandwich-01.jpg | sandwich | carrot | 17% | scanner | carrot, bread, broccoli |
| sandwich-02.jpg | sandwich | bread | 15% | scanner | bread, plastic wrap, bagel |
| sandwich-04.jpg | sandwich | food | 86% | auto | food, hamburger, bagel |
| sandwich-05.jpg | sandwich | food | 65% | scanner (blurry) | food, bread, carrot |
| sandwich-06.jpg | sandwich | sandwich | 62% | auto | sandwich, cabbage, taco |
| sandwich-07.jpg | sandwich | food | 72% | auto | food, hot dog, pie |
| sandwich-08.jpg | sandwich | food | 55% | scanner | food, taco, carrot |
| sandwich-12.jpg | sandwich | food | 74% | auto | food, sandwich, donut |
| scissors-01.jpg | scissors | scissors | 87% | auto | scissors, hammer, knife |
| sink-01.jpg | sink | sink | 73% | auto | sink, bathtub, bathroom sink |
| sink-03.jpg | sink | foot | 7% | scanner | foot, leg, hammer |
| sink-04.jpg | sink | (not sure) | 5% | scanner (blurry) |  |
| sofa-01.jpg | sofa | dog | 19% | scanner | dog, cat, chair |
| sofa-03.jpg | sofa | fork | 6% | scanner | fork, pancakes, person |
| sofa-04.jpg | sofa | cat | 95% | auto | cat, orange, lemon |
| sofa-05.jpg | sofa | furniture | 68% | auto | furniture, sofa, chair |
| sofa-06.jpg | sofa | sofa | 84% | auto | sofa, chair, cushion |
| sofa-07.jpg | sofa | furniture | 62% | auto | furniture, sofa, chair |
| sofa-08.jpg | sofa | sofa | 64% | auto | sofa, chair, seat belt |
| sofa-10.jpg | sofa | sofa | 70% | auto | sofa, rope, chair |
| sofa-11.jpg | sofa | sofa | 79% | auto | sofa, chair, cushion |
| spoon-01.jpg | spoon | spoon | 95% | auto | spoon, chopsticks, spatula |
| spoon-02.jpg | spoon | vegetable | 72% | auto | vegetable, spinach, carrot |
| suitcase-01.jpg | suitcase | suitcase | 38% | scanner | suitcase, backpack, seat belt |
| suitcase-02.jpg | suitcase | (not sure) | 5% | scanner |  |
| suitcase-03.jpg | suitcase | suitcase | 14% | scanner | suitcase, DVD, lighter |
| suitcase-05.jpg | suitcase | suitcase | 82% | auto | suitcase, orange, DVD |
| teddy-bear-02.jpg | teddy bear | teddy bear | 71% | auto | teddy bear, toy, doll |
| teddy-bear-04.jpg | teddy bear | teddy bear | 84% | auto | teddy bear, orange, pillow |
| teddy-bear-05.jpg | teddy bear | teddy bear | 68% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 95% | auto | teddy bear, honey, orange |
| toaster-01.jpg | toaster | toaster | 93% | auto | toaster, lighter, blender |
| toothbrush-01.jpg | toothbrush | toothbrush | 97% | auto | toothbrush, carrot, toothpaste |
| tv-01.jpg | tv | clothes | 58% | scanner | clothes, hat, coat |
| tv-04.jpg | tv | monitor | 59% | auto | monitor, apple, computer |
| tv-05.jpg | tv | electronics | 53% | scanner | electronics, monitor, soap |
| tv-06.jpg | tv | tv | 82% | auto | tv, hammer, monitor |
| tv-07.jpg | tv | monitor | 16% | scanner | monitor, tablet stand, webcam |
| tv-08.jpg | tv | monitor | 69% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | electronics | 56% | scanner | electronics, monitor, ticket |
| umbrella-01.jpg | umbrella | umbrella | 96% | auto | umbrella, balloon, ball |
| umbrella-02.jpg | umbrella | umbrella | 51% | auto | umbrella, kite, chair |
| umbrella-03.jpg | umbrella | umbrella | 92% | auto | umbrella, kite, tent |
| umbrella-06.jpg | umbrella | umbrella | 63% | auto | umbrella, rope, tent |
| umbrella-07.jpg | umbrella | umbrella | 72% | auto | umbrella, tent, cane |
| umbrella-10.jpg | umbrella | umbrella | 97% | auto | umbrella, tent, kite |
| umbrella-11.jpg | umbrella | umbrella | 90% | auto | umbrella, rain, coat |
| umbrella-12.jpg | umbrella | chopsticks | 18% | scanner | chopsticks, rolling pin, pen |
| vase-01.jpg | vase | horse | 93% | auto | horse, drum, book |
| vase-02.jpg | vase | glass | 49% | auto | glass, orange, vase |
| vase-04.jpg | vase | vase | 52% | auto | vase, asparagus, glass |
| vizwiz-apple-00689.jpg | apple | fruit | 60% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | vegetable | 56% | scanner | vegetable, carrot, pumpkin |
| vizwiz-backpack-00499.jpg | backpack | blanket | 17% | scanner | blanket, jacket, coat |
| vizwiz-bed-00316.jpg | bed | furniture | 68% | auto | furniture, bed, pillow |
| vizwiz-beer-00319.jpg | beer | can | 63% | auto | can, dice, soda |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 11% | scanner |  |
| vizwiz-box-00401.jpg | box | (not sure) | 12% | scanner |  |
| vizwiz-box-01128.jpg | box | box | 13% | scanner (blurry) | box, package, paper |
| vizwiz-cake-01066.jpg | cake | (not sure) | 5% | scanner |  |
| vizwiz-can-00840.jpg | can | (not sure) | 8% | scanner |  |
| vizwiz-can-01184.jpg | can | can | 16% | scanner | can, cup, juice |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 73% | auto | chair, seat belt, shower chair |
| vizwiz-coffee-00561.jpg | coffee | jar | 20% | scanner | jar, can, glass |
| vizwiz-coffee-00937.jpg | coffee | mug | 41% | scanner | mug, cup, travel mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | trash can | 13% | scanner | trash can, drum, speaker |
| vizwiz-computer-mouse-00672.jpg | computer mouse | electronics | 62% | auto | electronics, computer mouse, flashlight |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 5% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 23% | scanner | orange, carrot, peach |
| vizwiz-cookie-00772.jpg | cookie | (not sure) | 7% | scanner |  |
| vizwiz-corn-01008.jpg | corn | can | 24% | scanner | can, cup, peas |
| vizwiz-crackers-00558.jpg | crackers | juice | 16% | scanner | juice, juice box, hand |
| vizwiz-cup-00247.jpg | cup | cup | 46% | scanner (blurry) | cup, bucket, bowl |
| vizwiz-cup-00857.jpg | cup | cup | 45% | auto | cup, mug, glass |
| vizwiz-deodorant-00556.jpg | deodorant | finger | 22% | scanner | finger, hand, flashlight |
| vizwiz-dog-00025.jpg | dog | dog | 16% | scanner | dog, hot dog, dog leash |
| vizwiz-dog-00318.jpg | dog | dog | 52% | auto | dog, hot dog, dog leash |
| vizwiz-door-00190.jpg | door | airplane | 37% | scanner | airplane, knife, pen |
| vizwiz-dresser-00569.jpg | dresser | drawer | 65% | auto | drawer, dresser, cabinet |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 43% | scanner | coat rack, hanger, umbrella |
| vizwiz-finger-00182.jpg | finger | person | 78% | auto | person, finger, leg |
| vizwiz-flower-00395.jpg | flower | flowers | 49% | auto | flowers, flower, flower pot |
| vizwiz-foot-00080.jpg | foot | person | 59% | scanner | person, foot, shoes |
| vizwiz-foot-01040.jpg | foot | person | 68% | auto | person, foot, leg |
| vizwiz-glass-00808.jpg | glass | glass | 60% | auto | glass, eye, jar |
| vizwiz-glass-00952.jpg | glass | hand | 18% | scanner | hand, finger, foot |
| vizwiz-hair-00530.jpg | hair | person | 66% | scanner (blurry) | person, hair, head |
| vizwiz-heater-00502.jpg | heater | furniture | 72% | auto | furniture, drawer, leg |
| vizwiz-heater-01064.jpg | heater | (not sure) | 10% | scanner |  |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 10% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 80% | scanner (blurry) | jar, jam, glass |
| vizwiz-juice-00422.jpg | juice | juice | 28% | scanner | juice, juice box, soap |
| vizwiz-ketchup-00112.jpg | ketchup | (not sure) | 6% | scanner |  |
| vizwiz-ketchup-00220.jpg | ketchup | (not sure) | 6% | scanner |  |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, keys, music keyboard |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 47% | auto | keyboard, dice, eraser |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 17% | scanner | rope, finger, phone charger |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 96% | scanner | keyboard, toaster, music keyboard |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 88% | auto | keyboard, piano, music keyboard |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 7% | scanner |  |
| vizwiz-lotion-00026.jpg | lotion | soap | 15% | scanner | soap, light bulb, flashlight |
| vizwiz-lotion-01072.jpg | lotion | candle | 15% | scanner | candle, carrot, cup |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 7% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | (not sure) | 4% | scanner |  |
| vizwiz-medicine-00339.jpg | medicine | spoon | 13% | scanner | spoon, pen, knife |
| vizwiz-milk-00704.jpg | milk | cup | 18% | scanner (blurry) | cup, beer, can |
| vizwiz-money-00473.jpg | money | money | 85% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 46% | scanner (blurry) | money, sun, bill |
| vizwiz-monitor-00663.jpg | monitor | orange | 6% | scanner | orange, banana, carrot |
| vizwiz-mug-00104.jpg | mug | mug | 73% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 14% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 38% | scanner (blurry) | paper, bill, ticket |
| vizwiz-pear-00245.jpg | pear | fruit | 81% | scanner (blurry) | fruit, lime, pear |
| vizwiz-pen-00570.jpg | pen | (not sure) | 8% | scanner |  |
| vizwiz-phone-00274.jpg | phone | flashlight | 34% | scanner (blurry) | flashlight, phone, lighter |
| vizwiz-phone-00562.jpg | phone | phone | 68% | auto | phone, clipboard, DVD |
| vizwiz-phone-01124.jpg | phone | phone | 30% | scanner (blurry) | phone, mirror, DVD |
| vizwiz-phone-01130.jpg | phone | DVD | 15% | scanner (blurry) | DVD, phone, remote |
| vizwiz-picture-00559.jpg | picture | photo frame | 46% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | person | 77% | auto | person, finger, lime |
| vizwiz-pills-01113.jpg | pills | potato | 4% | scanner (blurry) | potato, flashlight, sweet potato |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 87% | auto | pumpkin, corn, orange |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 4% | scanner |  |
| vizwiz-radio-00642.jpg | radio | radio | 36% | scanner | radio, ticket, remote |
| vizwiz-remote-00012.jpg | remote | remote | 77% | auto | remote, calculator, finger |
| vizwiz-remote-00387.jpg | remote | remote | 92% | auto | remote, game controller, calculator |
| vizwiz-remote-00439.jpg | remote | remote | 90% | auto | remote, lighter, calculator |
| vizwiz-scissors-00315.jpg | scissors | tool | 100% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | (not sure) | 7% | scanner |  |
| vizwiz-shampoo-00631.jpg | shampoo | peas | 29% | scanner | peas, dice, finger |
| vizwiz-shaving-cream-00244.jpg | shaving cream | orange | 13% | scanner | orange, carrot, cup |
| vizwiz-shaving-cream-00733.jpg | shaving cream | lighter | 17% | scanner | lighter, can, deodorant |
| vizwiz-shoes-00005.jpg | shoes | person | 65% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 23% | scanner | sink, bathroom sink, toilet |
| vizwiz-soap-00460.jpg | soap | clothes | 58% | scanner | clothes, shirt, blanket |
| vizwiz-soda-01042.jpg | soda | beer | 27% | scanner (blurry) | beer, flashlight, urinal bottle |
| vizwiz-soda-01207.jpg | soda | flashlight | 31% | scanner (blurry) | flashlight, finger, hand |
| vizwiz-soup-00995.jpg | soup | soup | 48% | auto | soup, soap, can |
| vizwiz-spinach-01009.jpg | spinach | cup | 27% | scanner | cup, can, soup |
| vizwiz-spray-bottle-00364.jpg | spray bottle | cup | 7% | scanner (blurry) | cup, finger, lighter |
| vizwiz-stairs-00699.jpg | stairs | stairs | 81% | auto | stairs, ladder, rope |
| vizwiz-stove-00678.jpg | stove | stove | 13% | scanner | stove, lighter, pot |
| vizwiz-sugar-00134.jpg | sugar | lighter | 4% | scanner | lighter, cup, envelope |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 8% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 47% | scanner | tissues, juice, soap |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 90% | auto | toilet paper, hand, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 6% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 22% | scanner | flashlight, tv, lamp |
| vizwiz-water-00659.jpg | water | flashlight | 12% | scanner | flashlight, baby bottle, lighter |
| vizwiz-water-bottle-00049.jpg | water bottle | drink | 57% | scanner | drink, water bottle, urinal bottle |
| vizwiz-wine-00669.jpg | wine | beer | 22% | scanner | beer, honey, urinal bottle |
| vizwiz-wine-00946.jpg | wine | paper | 16% | scanner (blurry) | paper, bill, ticket |
| vizwiz-wine-01068.jpg | wine | flashlight | 16% | scanner (blurry) | flashlight, light bulb, lamp |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 71% | auto | glass, wine, water |
| vizwiz-yogurt-01051.jpg | yogurt | CD | 8% | scanner | CD, soap, drum |
| water-bottle-01.jpg | water bottle | hand | 39% | scanner | hand, finger, arm |
| wine-glass-02.jpg | wine glass | wine | 52% | auto | wine, glass, hammer |

### test-images-public/dev-phone, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 43% | 56% | 52% | 12% | 11% | 10% | 229 / 418 | 329 | vocab 250, none 27 |
| coco | 172 | 50% | 63% | 67% | 16% | 12% | 6% | 236 / 437 | 338 | vocab 161, none 11 |
| cluttered | 131 | 45% | 58% | 67% | 18% | 12% | 6% | 242 / 456 | 346 | vocab 123, none 8 |
| fruit | 12 | 50% | 75% | 67% | 8% | 33% | 0% | 220 / 456 | 342 | vocab 12 |
| phone | 277 | 43% | 56% | 52% | 12% | 11% | 10% | 229 / 418 | 329 | vocab 250, none 27 |
| clothes & accessories | 11 | 73% | 73% | 73% | 0% | 0% | 0% | 173 / 322 | 309 | vocab 11 |
| table | 41 | 66% | 78% | 68% | 7% | 10% | 7% | 215 / 363 | 311 | vocab 38, none 3 |
| single | 41 | 66% | 78% | 68% | 7% | 10% | 7% | 215 / 363 | 311 | vocab 38, none 3 |
| furniture & home | 48 | 38% | 56% | 60% | 19% | 10% | 19% | 200 / 476 | 308 | none 9, vocab 39 |
| office & reading | 5 | 20% | 40% | 0% | 0% | 0% | 40% | 173 / 248 | 248 | vocab 3, none 2 |
| kitchen & dining | 46 | 50% | 54% | 54% | 24% | 0% | 7% | 237 / 402 | 328 | vocab 43, none 3 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 139 / 279 | 235 | vocab 7 |
| food & meals | 34 | 26% | 50% | 41% | 0% | 32% | 6% | 295 / 439 | 393 | vocab 32, none 2 |
| pets & animals | 18 | 83% | 94% | 94% | 6% | 11% | 0% | 168 / 367 | 256 | vocab 18 |
| electronics & media | 28 | 54% | 68% | 64% | 14% | 11% | 4% | 221 / 437 | 325 | vocab 27, none 1 |
| people & body | 12 | 8% | 42% | 58% | 42% | 25% | 8% | 278 / 376 | 363 | vocab 11, none 1 |
| personal items | 13 | 62% | 62% | 23% | 0% | 0% | 23% | 221 / 363 | 317 | none 3, vocab 10 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 179 / 303 | 248 | vocab 2, none 1 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 225 / 304 | 348 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 23% | 23% | 15% | 0% | 0% | 15% | 265 / 463 | 364 | vocab 11, none 2 |
| held | 105 | 30% | 44% | 26% | 5% | 10% | 15% | 219 / 371 | 315 | vocab 89, none 16 |
| vizwiz | 105 | 30% | 44% | 26% | 5% | 10% | 15% | 219 / 371 | 315 | vocab 89, none 16 |
| drinks | 16 | 6% | 13% | 6% | 6% | 6% | 13% | 285 / 418 | 380 | vocab 14, none 2 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 0% | 215 / 299 | 303 | vocab 2 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 228 / 228 | 315 | vocab 1 |
| health & medical | 3 | 0% | 0% | 0% | 0% | 0% | 0% | 295 / 354 | 374 | vocab 3 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 73% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 97% | scanner (blurry) | fruit, apple, pear |
| backpack-01.jpg | backpack | backpack | 84% | auto | backpack, coat, purse |
| banana-01.jpg | banana | face | 10% | scanner (blurry) | face, head, person |
| banana-02.jpg | banana | banana | 84% | auto | banana, corn, lemon |
| banana-04.jpg | banana | banana | 87% | auto | banana, apple, mango |
| banana-05.jpg | banana | banana | 87% | auto | banana, zucchini, cucumber |
| banana-06.jpg | banana | fruit | 56% | scanner (blurry) | fruit, banana, green beans |
| bed-01.jpg | bed | (not sure) | 9% | scanner |  |
| bed-03.jpg | bed | (not sure) | 9% | scanner |  |
| bed-04.jpg | bed | blanket | 65% | auto | blanket, sheets, bed |
| bed-05.jpg | bed | bed | 45% | auto | bed, mattress, sheets |
| bed-06.jpg | bed | curtains | 46% | auto | curtains, umbrella, tent |
| bed-09.jpg | bed | furniture | 73% | auto | furniture, blanket, rope |
| bed-10.jpg | bed | bicycle | 94% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 35% | scanner | blanket, cat, phone charger |
| bed-12.jpg | bed | blanket | 25% | scanner | blanket, bed, bedpan |
| book-01.jpg | book | dog | 22% | scanner | dog, hot dog, book |
| book-02.jpg | book | crayons | 31% | scanner | crayons, chopsticks, pencil |
| bowl-01.jpg | bowl | broccoli | 59% | auto | broccoli, spinach, peas |
| bowl-02.jpg | bowl | pasta | 60% | auto | pasta, broccoli, noodles |
| bowl-04.jpg | bowl | soup | 61% | auto | soup, chopsticks, bowl |
| bowl-05.jpg | bowl | food | 61% | auto | food, pie, sweet potato |
| bowl-07.jpg | bowl | lemon | 32% | scanner | lemon, orange, banana |
| bowl-09.jpg | bowl | plate | 16% | scanner | plate, carrot, soup |
| bowl-10.jpg | bowl | vegetable | 65% | auto | vegetable, tomato, carrot |
| bowl-12.jpg | bowl | (not sure) | 8% | scanner |  |
| broccoli-01.jpg | broccoli | broccoli | 80% | auto | broccoli, corn, peas |
| broccoli-03.jpg | broccoli | vegetable | 71% | auto | vegetable, broccoli, peas |
| cake-01.jpg | cake | food | 92% | scanner (blurry) | food, cake, cupcake |
| cake-02.jpg | cake | cake | 93% | auto | cake, flowers, cupcake |
| cake-03.jpg | cake | cake | 59% | auto | cake, peas, pie |
| cake-05.jpg | cake | cake | 22% | scanner | cake, mop, dice |
| cake-07.jpg | cake | food | 77% | auto | food, bread, bagel |
| carrot-01.jpg | carrot | carrot | 85% | auto | carrot, corn, sweet potato |
| carrot-02.jpg | carrot | carrot | 94% | auto | carrot, orange, sweet potato |
| carrot-03.jpg | carrot | carrot | 99% | auto | carrot, sweet potato, orange |
| cat-01.jpg | cat | cat | 98% | auto | cat, rabbit, book |
| cat-02.jpg | cat | cat | 83% | auto | cat, rabbit, orange |
| cat-03.jpg | cat | cat | 73% | auto | cat, eye, hat |
| cat-05.jpg | cat | animal | 74% | auto | animal, rabbit, bird |
| cat-07.jpg | cat | cat | 93% | auto | cat, rabbit, squirrel |
| cat-10.jpg | cat | cat | 99% | auto | cat, squirrel, book |
| cat-11.jpg | cat | cat | 98% | auto | cat, eye, rabbit |
| cat-12.jpg | cat | cat | 53% | auto | cat, squirrel, rabbit |
| chair-01.jpg | chair | chair | 14% | scanner | chair, ball, cushion |
| chair-02.jpg | chair | mirror | 91% | auto | mirror, chair, door |
| chair-04.jpg | chair | furniture | 67% | auto | furniture, chair, glass |
| chair-05.jpg | chair | chair | 67% | auto | chair, armchair, recliner |
| chair-07.jpg | chair | chair | 69% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | paper clip | 18% | scanner | paper clip, paper, notebook |
| chair-10.jpg | chair | (not sure) | 4% | scanner |  |
| clock-01.jpg | clock | clock | 79% | auto | clock, honey, watch |
| clock-03.jpg | clock | clock | 70% | auto | clock, watch, fork |
| clock-04.jpg | clock | clock | 91% | auto | clock, watch, kitchen timer |
| clock-05.jpg | clock | clock | 93% | auto | clock, kitchen timer, watch |
| cup-01.jpg | cup | cup | 67% | auto | cup, mug, can |
| cup-03.jpg | cup | drink | 79% | scanner (blurry) | drink, juice, lemon |
| dog-01.jpg | dog | dog | 60% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 86% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 87% | auto | dog leash, dog, hot dog |
| dog-07.jpg | dog | dog | 74% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 80% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 54% | auto | dog, dog leash, hot dog |
| dog-11.jpg | dog | dog | 62% | auto | dog, dog leash, hot dog |
| dog-12.jpg | dog | animal | 65% | auto | animal, dog, dog leash |
| donut-01.jpg | donut | food | 73% | auto | food, donut, candy |
| donut-02.jpg | donut | donut | 49% | auto | donut, carrot, bagel |
| fork-01.jpg | fork | fork | 97% | auto | fork, lime, spoon |
| fridge-01.jpg | fridge | fridge | 64% | auto | fridge, drawer, freezer |
| fridge-04.jpg | fridge | fridge | 77% | auto | fridge, spatula, freezer |
| fridge-05.jpg | fridge | fridge | 19% | scanner | fridge, door, ladder |
| fridge-06.jpg | fridge | fridge | 76% | auto | fridge, freezer, blender |
| fridge-08.jpg | fridge | fridge | 42% | scanner | fridge, mirror, uniform |
| fridge-09.jpg | fridge | fridge | 58% | auto | fridge, door, freezer |
| fridge-10.jpg | fridge | can | 14% | scanner | can, soda, juice |
| fridge-12.jpg | fridge | (not sure) | 11% | scanner |  |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, piano |
| keyboard-03.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, computer mouse |
| knife-01.jpg | knife | knife | 96% | auto | knife, ticket, spatula |
| knife-03.jpg | knife | fork | 79% | auto | fork, spoon, chopsticks |
| laptop-02.jpg | laptop | keyboard | 65% | auto | keyboard, laptop, computer |
| laptop-03.jpg | laptop | laptop | 77% | auto | laptop, envelope, notebook |
| laptop-04.jpg | laptop | (not sure) | 3% | scanner |  |
| laptop-05.jpg | laptop | laptop | 52% | auto | laptop, chair, desk |
| laptop-06.jpg | laptop | laptop | 77% | auto | laptop, notebook, webcam |
| laptop-07.jpg | laptop | laptop | 62% | auto | laptop, keyboard, notebook |
| microwave-01.jpg | microwave | microwave | 67% | auto | microwave, pie, oven |
| microwave-02.jpg | microwave | microwave | 43% | scanner | microwave, radio, toaster |
| orange-01.jpg | orange | orange | 53% | auto | orange, lemon, mango |
| orange-02.jpg | orange | orange | 92% | auto | orange, lemon, grapefruit |
| oven-01.jpg | oven | oven | 15% | scanner | oven, bread, baking tray |
| oven-02.jpg | oven | bread | 55% | auto | bread, bagel, pie |
| oven-04.jpg | oven | food | 73% | auto | food, pizza, pie |
| oven-05.jpg | oven | rabbit | 19% | scanner | rabbit, dog, cat |
| oven-06.jpg | oven | stove | 29% | scanner | stove, oven, toaster |
| oven-07.jpg | oven | (not sure) | 11% | scanner |  |
| person-02.jpg | person | bandage | 14% | scanner | bandage, face, head |
| person-04.jpg | person | (not sure) | 8% | scanner |  |
| person-05.jpg | person | clothes | 80% | auto | clothes, hat, face |
| person-06.jpg | person | clothes | 62% | auto | clothes, tie, person |
| person-08.jpg | person | toothbrush | 35% | scanner | toothbrush, mouth, child |
| person-09.jpg | person | child | 66% | auto | child, baby, corn |
| person-10.jpg | person | hat | 52% | auto | hat, mouth, book |
| person-12.jpg | person | clothes | 94% | auto | clothes, tie, skirt |
| phone-01.jpg | phone | (not sure) | 11% | scanner |  |
| phone-02.jpg | phone | car | 30% | scanner | car, taxi, book |
| pizza-01.jpg | pizza | carrot | 20% | scanner | carrot, pie, lettuce |
| pizza-02.jpg | pizza | vegetable | 52% | scanner | vegetable, lettuce, carrot |
| pizza-07.jpg | pizza | pizza | 68% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | food | 53% | scanner | food, pie, carrot |
| pizza-09.jpg | pizza | food | 87% | auto | food, pizza, pie |
| pizza-10.jpg | pizza | pizza | 63% | auto | pizza, pie, pancakes |
| pizza-11.jpg | pizza | food | 55% | scanner | food, honey, mushroom |
| pizza-12.jpg | pizza | carrot | 14% | scanner | carrot, bread, orange |
| plant-01.jpg | plant | flowers | 62% | auto | flowers, flower, orange |
| plant-03.jpg | plant | plant | 47% | auto | plant, Christmas tree, tree |
| plant-04.jpg | plant | (not sure) | 4% | scanner |  |
| remote-01.jpg | remote | remote | 49% | auto | remote, eraser, knife |
| sandwich-01.jpg | sandwich | carrot | 17% | scanner | carrot, sandwich, broccoli |
| sandwich-02.jpg | sandwich | plastic wrap | 16% | scanner | plastic wrap, bread, bagel |
| sandwich-04.jpg | sandwich | food | 86% | auto | food, hamburger, bagel |
| sandwich-05.jpg | sandwich | food | 68% | scanner (blurry) | food, bread, carrot |
| sandwich-06.jpg | sandwich | sandwich | 62% | auto | sandwich, cabbage, taco |
| sandwich-07.jpg | sandwich | food | 72% | auto | food, hot dog, pie |
| sandwich-08.jpg | sandwich | carrot | 16% | scanner | carrot, bacon, taco |
| sandwich-12.jpg | sandwich | food | 74% | auto | food, sandwich, pancakes |
| scissors-01.jpg | scissors | scissors | 86% | auto | scissors, hammer, knife |
| sink-01.jpg | sink | sink | 84% | auto | sink, cup, bathroom sink |
| sink-03.jpg | sink | foot | 7% | scanner | foot, leg, hammer |
| sink-04.jpg | sink | snow | 25% | scanner (blurry) | snow, sky, sun |
| sofa-01.jpg | sofa | dog | 19% | scanner | dog, chair, cat |
| sofa-03.jpg | sofa | sausage | 28% | scanner | sausage, sweet potato, pasta |
| sofa-04.jpg | sofa | cat | 91% | auto | cat, orange, lighter |
| sofa-05.jpg | sofa | furniture | 68% | auto | furniture, sofa, pillow |
| sofa-06.jpg | sofa | sofa | 81% | auto | sofa, chair, cushion |
| sofa-07.jpg | sofa | sofa | 61% | auto | sofa, chair, cushion |
| sofa-08.jpg | sofa | sofa | 83% | auto | sofa, chair, bench |
| sofa-10.jpg | sofa | sofa | 70% | auto | sofa, fence, bench |
| sofa-11.jpg | sofa | sofa | 79% | auto | sofa, chair, cushion |
| spoon-01.jpg | spoon | spoon | 95% | auto | spoon, chopsticks, rope |
| spoon-02.jpg | spoon | vegetable | 65% | auto | vegetable, spinach, green beans |
| suitcase-01.jpg | suitcase | suitcase | 38% | scanner | suitcase, backpack, seat belt |
| suitcase-02.jpg | suitcase | (not sure) | 5% | scanner |  |
| suitcase-03.jpg | suitcase | suitcase | 14% | scanner | suitcase, DVD, lighter |
| suitcase-05.jpg | suitcase | suitcase | 82% | auto | suitcase, orange, DVD |
| teddy-bear-02.jpg | teddy bear | teddy bear | 85% | auto | teddy bear, eye, toy |
| teddy-bear-04.jpg | teddy bear | teddy bear | 84% | auto | teddy bear, orange, pillow |
| teddy-bear-05.jpg | teddy bear | teddy bear | 68% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 95% | auto | teddy bear, honey, doll |
| toaster-01.jpg | toaster | toaster | 90% | auto | toaster, lighter, kettle |
| toothbrush-01.jpg | toothbrush | toothbrush | 97% | auto | toothbrush, carrot, toothpaste |
| tv-01.jpg | tv | clothes | 58% | scanner | clothes, hat, coat |
| tv-04.jpg | tv | monitor | 59% | auto | monitor, apple, computer |
| tv-05.jpg | tv | electronics | 53% | scanner | electronics, monitor, paper |
| tv-06.jpg | tv | tv | 82% | auto | tv, hammer, monitor |
| tv-07.jpg | tv | monitor | 16% | scanner | monitor, tablet stand, webcam |
| tv-08.jpg | tv | monitor | 69% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | electronics | 56% | scanner | electronics, monitor, ticket |
| umbrella-01.jpg | umbrella | umbrella | 94% | auto | umbrella, balloon, tent |
| umbrella-02.jpg | umbrella | umbrella | 66% | auto | umbrella, kite, swimsuit |
| umbrella-03.jpg | umbrella | umbrella | 81% | auto | umbrella, kite, balloon |
| umbrella-06.jpg | umbrella | umbrella | 63% | auto | umbrella, envelope, tent |
| umbrella-07.jpg | umbrella | umbrella | 72% | auto | umbrella, tent, cane |
| umbrella-10.jpg | umbrella | umbrella | 97% | auto | umbrella, tent, kite |
| umbrella-11.jpg | umbrella | umbrella | 90% | auto | umbrella, rain, coat |
| umbrella-12.jpg | umbrella | chopsticks | 17% | scanner | chopsticks, rolling pin, pen |
| vase-01.jpg | vase | horse | 95% | auto | horse, book, drum |
| vase-02.jpg | vase | glass | 49% | auto | glass, honey, vase |
| vase-04.jpg | vase | vase | 52% | auto | vase, asparagus, glass |
| vizwiz-apple-00689.jpg | apple | fruit | 60% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | vegetable | 56% | scanner | vegetable, carrot, pumpkin |
| vizwiz-backpack-00499.jpg | backpack | blanket | 17% | scanner | blanket, jacket, coat |
| vizwiz-bed-00316.jpg | bed | furniture | 68% | auto | furniture, bed, pillow |
| vizwiz-beer-00319.jpg | beer | can | 63% | auto | can, dice, soda |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 11% | scanner |  |
| vizwiz-box-00401.jpg | box | (not sure) | 12% | scanner |  |
| vizwiz-box-01128.jpg | box | box | 13% | scanner (blurry) | box, package, paper |
| vizwiz-cake-01066.jpg | cake | (not sure) | 5% | scanner |  |
| vizwiz-can-00840.jpg | can | (not sure) | 8% | scanner |  |
| vizwiz-can-01184.jpg | can | book | 3% | scanner | book, Bible, peas |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 73% | auto | chair, seat belt, shower chair |
| vizwiz-coffee-00561.jpg | coffee | jar | 52% | scanner | jar, salt, glass |
| vizwiz-coffee-00937.jpg | coffee | mug | 41% | scanner | mug, cup, travel mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | trash can | 13% | scanner | trash can, drum, speaker |
| vizwiz-computer-mouse-00672.jpg | computer mouse | electronics | 62% | auto | electronics, computer mouse, flashlight |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 5% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 23% | scanner | orange, carrot, peach |
| vizwiz-cookie-00772.jpg | cookie | food | 67% | auto | food, cookie, bread |
| vizwiz-corn-01008.jpg | corn | can | 24% | scanner | can, cup, peas |
| vizwiz-crackers-00558.jpg | crackers | person | 58% | scanner | person, hand, finger |
| vizwiz-cup-00247.jpg | cup | cup | 46% | scanner (blurry) | cup, bucket, bowl |
| vizwiz-cup-00857.jpg | cup | cup | 48% | auto | cup, mug, tea |
| vizwiz-deodorant-00556.jpg | deodorant | finger | 22% | scanner | finger, hand, flashlight |
| vizwiz-dog-00025.jpg | dog | dog | 16% | scanner | dog, hot dog, dog leash |
| vizwiz-dog-00318.jpg | dog | dog | 52% | auto | dog, hot dog, dog leash |
| vizwiz-door-00190.jpg | door | airplane | 37% | scanner | airplane, knife, pen |
| vizwiz-dresser-00569.jpg | dresser | drawer | 72% | auto | drawer, dresser, cabinet |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 43% | scanner | coat rack, hanger, umbrella |
| vizwiz-finger-00182.jpg | finger | finger | 56% | auto | finger, leg, hand |
| vizwiz-flower-00395.jpg | flower | flowers | 49% | auto | flowers, flower, flower pot |
| vizwiz-foot-00080.jpg | foot | person | 59% | scanner | person, foot, shoes |
| vizwiz-foot-01040.jpg | foot | person | 68% | auto | person, foot, leg |
| vizwiz-glass-00808.jpg | glass | glass | 56% | auto | glass, jar, water |
| vizwiz-glass-00952.jpg | glass | hand | 18% | scanner | hand, finger, foot |
| vizwiz-hair-00530.jpg | hair | person | 66% | scanner (blurry) | person, hair, head |
| vizwiz-heater-00502.jpg | heater | furniture | 59% | scanner | furniture, drawer, dresser |
| vizwiz-heater-01064.jpg | heater | (not sure) | 10% | scanner |  |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 10% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 80% | scanner (blurry) | jar, jam, glass |
| vizwiz-juice-00422.jpg | juice | juice | 28% | scanner | juice, juice box, soap |
| vizwiz-ketchup-00112.jpg | ketchup | ketchup | 13% | scanner | ketchup, soap, lighter |
| vizwiz-ketchup-00220.jpg | ketchup | beer | 19% | scanner | beer, ketchup, carrot |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, keys, music keyboard |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 97% | auto | keyboard, dice, laptop |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 17% | scanner | rope, finger, phone charger |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 96% | scanner | keyboard, toaster, music keyboard |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 88% | auto | keyboard, piano, music keyboard |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 5% | scanner |  |
| vizwiz-lotion-00026.jpg | lotion | soap | 15% | scanner | soap, light bulb, flashlight |
| vizwiz-lotion-01072.jpg | lotion | candle | 15% | scanner | candle, cup, lighter |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 7% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | (not sure) | 4% | scanner |  |
| vizwiz-medicine-00339.jpg | medicine | spoon | 13% | scanner | spoon, pen, knife |
| vizwiz-milk-00704.jpg | milk | cup | 18% | scanner (blurry) | cup, beer, can |
| vizwiz-money-00473.jpg | money | money | 85% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 46% | scanner (blurry) | money, sun, bill |
| vizwiz-monitor-00663.jpg | monitor | orange | 6% | scanner | orange, banana, carrot |
| vizwiz-mug-00104.jpg | mug | mug | 73% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 14% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 38% | scanner (blurry) | paper, bill, ticket |
| vizwiz-pear-00245.jpg | pear | fruit | 87% | scanner (blurry) | fruit, pear, lime |
| vizwiz-pen-00570.jpg | pen | (not sure) | 8% | scanner |  |
| vizwiz-phone-00274.jpg | phone | flashlight | 33% | scanner (blurry) | flashlight, lighter, light bulb |
| vizwiz-phone-00562.jpg | phone | phone | 49% | auto | phone, wallet, remote |
| vizwiz-phone-01124.jpg | phone | phone | 30% | scanner (blurry) | phone, mirror, DVD |
| vizwiz-phone-01130.jpg | phone | phone | 43% | scanner (blurry) | phone, DVD, wallet |
| vizwiz-picture-00559.jpg | picture | photo frame | 33% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | lime | 12% | scanner | lime, finger, hand |
| vizwiz-pills-01113.jpg | pills | potato | 4% | scanner (blurry) | potato, flashlight, sweet potato |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 87% | auto | pumpkin, corn, orange |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 4% | scanner |  |
| vizwiz-radio-00642.jpg | radio | radio | 36% | scanner | radio, ticket, remote |
| vizwiz-remote-00012.jpg | remote | remote | 77% | auto | remote, calculator, finger |
| vizwiz-remote-00387.jpg | remote | remote | 92% | auto | remote, game controller, calculator |
| vizwiz-remote-00439.jpg | remote | remote | 85% | auto | remote, lighter, keyboard |
| vizwiz-scissors-00315.jpg | scissors | tool | 100% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | (not sure) | 7% | scanner |  |
| vizwiz-shampoo-00631.jpg | shampoo | peas | 29% | scanner | peas, dice, finger |
| vizwiz-shaving-cream-00244.jpg | shaving cream | orange | 13% | scanner | orange, carrot, cup |
| vizwiz-shaving-cream-00733.jpg | shaving cream | lighter | 17% | scanner | lighter, can, deodorant |
| vizwiz-shoes-00005.jpg | shoes | person | 65% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 23% | scanner | sink, bathroom sink, toilet |
| vizwiz-soap-00460.jpg | soap | clothes | 58% | scanner | clothes, shirt, blanket |
| vizwiz-soda-01042.jpg | soda | beer | 27% | scanner (blurry) | beer, flashlight, urinal bottle |
| vizwiz-soda-01207.jpg | soda | flashlight | 31% | scanner (blurry) | flashlight, finger, hand |
| vizwiz-soup-00995.jpg | soup | soup | 48% | auto | soup, soap, can |
| vizwiz-spinach-01009.jpg | spinach | cup | 27% | scanner | cup, can, soup |
| vizwiz-spray-bottle-00364.jpg | spray bottle | cup | 7% | scanner (blurry) | cup, finger, lighter |
| vizwiz-stairs-00699.jpg | stairs | stairs | 81% | auto | stairs, ladder, rope |
| vizwiz-stove-00678.jpg | stove | stove | 13% | scanner | stove, lighter, pot |
| vizwiz-sugar-00134.jpg | sugar | lighter | 4% | scanner | lighter, cup, envelope |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 8% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 47% | scanner | tissues, juice, soap |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 90% | auto | toilet paper, hand, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 6% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 22% | scanner | flashlight, tv, lamp |
| vizwiz-water-00659.jpg | water | flashlight | 12% | scanner | flashlight, baby bottle, lighter |
| vizwiz-water-bottle-00049.jpg | water bottle | drink | 57% | scanner | drink, water bottle, glass |
| vizwiz-wine-00669.jpg | wine | beer | 44% | scanner | beer, urinal bottle, honey |
| vizwiz-wine-00946.jpg | wine | paper | 16% | scanner (blurry) | paper, bill, ticket |
| vizwiz-wine-01068.jpg | wine | flashlight | 16% | scanner (blurry) | flashlight, light bulb, lamp |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 71% | auto | glass, wine, water |
| vizwiz-yogurt-01051.jpg | yogurt | CD | 8% | scanner | CD, soap, drum |
| water-bottle-01.jpg | water bottle | hand | 39% | scanner | hand, finger, arm |
| wine-glass-02.jpg | wine glass | wine | 52% | auto | wine, glass, glasses |

### test-images-public/dev-ring-wifi, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 44% | 59% | 53% | 12% | 11% | 13% | 105 / 183 | 138 | vocab 241, none 36 |
| coco | 172 | 50% | 66% | 67% | 15% | 13% | 6% | 108 / 205 | 142 | vocab 162, none 10 |
| cluttered | 131 | 46% | 63% | 66% | 16% | 15% | 4% | 112 / 208 | 148 | vocab 126, none 5 |
| fruit | 12 | 67% | 83% | 83% | 8% | 25% | 0% | 90 / 207 | 178 | vocab 12 |
| ring-wifi | 277 | 44% | 59% | 53% | 12% | 11% | 13% | 105 / 183 | 138 | vocab 241, none 36 |
| clothes & accessories | 11 | 73% | 73% | 82% | 0% | 9% | 0% | 94 / 178 | 124 | vocab 11 |
| table | 41 | 63% | 76% | 73% | 10% | 7% | 12% | 94 / 121 | 124 | vocab 36, none 5 |
| single | 41 | 63% | 76% | 73% | 10% | 7% | 12% | 94 / 121 | 124 | vocab 36, none 5 |
| furniture & home | 48 | 35% | 56% | 52% | 15% | 10% | 15% | 110 / 210 | 140 | none 7, vocab 41 |
| office & reading | 5 | 40% | 40% | 0% | 0% | 0% | 20% | 93 / 113 | 122 | vocab 4, none 1 |
| kitchen & dining | 46 | 52% | 61% | 54% | 22% | 0% | 11% | 105 / 160 | 134 | vocab 41, none 5 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 85 / 159 | 115 | vocab 7 |
| food & meals | 34 | 21% | 47% | 44% | 0% | 38% | 18% | 127 / 205 | 157 | vocab 28, none 6 |
| pets & animals | 18 | 78% | 100% | 94% | 11% | 6% | 0% | 73 / 156 | 103 | vocab 18 |
| electronics & media | 28 | 54% | 71% | 64% | 21% | 4% | 4% | 100 / 164 | 130 | vocab 27, none 1 |
| people & body | 12 | 8% | 42% | 58% | 33% | 42% | 0% | 114 / 181 | 144 | vocab 12 |
| personal items | 13 | 69% | 69% | 23% | 0% | 0% | 23% | 102 / 127 | 131 | none 3, vocab 10 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 80 / 112 | 110 | vocab 2, none 1 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 99 / 114 | 129 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 46% | 46% | 31% | 8% | 0% | 31% | 117 / 158 | 146 | vocab 9, none 4 |
| held | 105 | 35% | 48% | 30% | 8% | 9% | 25% | 101 / 156 | 131 | vocab 79, none 26 |
| vizwiz | 105 | 35% | 48% | 30% | 8% | 9% | 25% | 101 / 156 | 131 | vocab 79, none 26 |
| drinks | 16 | 13% | 19% | 13% | 6% | 0% | 31% | 121 / 187 | 151 | vocab 11, none 5 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 50% | 87 / 90 | 116 | vocab 1, none 1 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 43 / 43 | 75 | vocab 1 |
| health & medical | 3 | 0% | 0% | 33% | 33% | 0% | 33% | 123 / 153 | 153 | vocab 2, none 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 87% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 96% | scanner (blurry) | fruit, apple, pear |
| backpack-01.jpg | backpack | backpack | 68% | auto | backpack, book, purse |
| banana-01.jpg | banana | banana | 41% | scanner (blurry) | banana, face, finger |
| banana-02.jpg | banana | banana | 45% | auto | banana, lemon, pear |
| banana-04.jpg | banana | banana | 55% | auto | banana, pear, mango |
| banana-05.jpg | banana | banana | 72% | auto | banana, Christmas tree, green beans |
| banana-06.jpg | banana | banana | 47% | auto | banana, corn, Christmas tree |
| bed-01.jpg | bed | (not sure) | 5% | scanner |  |
| bed-03.jpg | bed | book | 16% | scanner | book, chopsticks, soap |
| bed-04.jpg | bed | blanket | 72% | auto | blanket, sheets, bedpan |
| bed-05.jpg | bed | furniture | 77% | auto | furniture, bed, bedpan |
| bed-06.jpg | bed | curtains | 32% | scanner | curtains, umbrella, tent |
| bed-09.jpg | bed | blanket | 34% | scanner | blanket, bedpan, book |
| bed-10.jpg | bed | bicycle | 62% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | furniture | 54% | scanner | furniture, blanket, cat |
| bed-12.jpg | bed | blanket | 26% | scanner | blanket, bed, sheets |
| book-01.jpg | book | dog | 13% | scanner | dog, hot dog, rabbit |
| book-02.jpg | book | crayons | 33% | scanner | crayons, chopsticks, pencil |
| bowl-01.jpg | bowl | broccoli | 60% | auto | broccoli, soup, carrot |
| bowl-02.jpg | bowl | food | 73% | auto | food, pasta, broccoli |
| bowl-04.jpg | bowl | soup | 62% | auto | soup, chopsticks, bowl |
| bowl-05.jpg | bowl | food | 53% | scanner | food, pie, carrot |
| bowl-07.jpg | bowl | lemon | 46% | scanner | lemon, carrot, orange |
| bowl-09.jpg | bowl | plate | 13% | scanner | plate, bowl, soup |
| bowl-10.jpg | bowl | vegetable | 54% | scanner | vegetable, carrot, soup |
| bowl-12.jpg | bowl | food | 50% | scanner | food, pasta, soap |
| broccoli-01.jpg | broccoli | broccoli | 93% | auto | broccoli, cauliflower, cabbage |
| broccoli-03.jpg | broccoli | vegetable | 69% | auto | vegetable, broccoli, strawberry |
| cake-01.jpg | cake | food | 69% | scanner (blurry) | food, cake, cupcake |
| cake-02.jpg | cake | cake | 91% | auto | cake, cupcake, flowers |
| cake-03.jpg | cake | cake | 73% | auto | cake, peas, rosary |
| cake-05.jpg | cake | mop | 14% | scanner | mop, blanket, rope |
| cake-07.jpg | cake | food | 74% | auto | food, bread, bagel |
| carrot-01.jpg | carrot | carrot | 97% | auto | carrot, corn, sweet potato |
| carrot-02.jpg | carrot | carrot | 50% | auto | carrot, orange, sweet potato |
| carrot-03.jpg | carrot | carrot | 100% | auto | carrot, sweet potato, corn |
| cat-01.jpg | cat | cat | 58% | auto | cat, rabbit, squirrel |
| cat-02.jpg | cat | cat | 78% | auto | cat, rabbit, orange |
| cat-03.jpg | cat | cat | 80% | auto | cat, hat, orange |
| cat-05.jpg | cat | bird | 65% | auto | bird, squirrel, cat |
| cat-07.jpg | cat | cat | 48% | auto | cat, rabbit, dog |
| cat-10.jpg | cat | cat | 99% | auto | cat, book, orange |
| cat-11.jpg | cat | cat | 99% | auto | cat, squirrel, rabbit |
| cat-12.jpg | cat | cat | 63% | auto | cat, squirrel, rabbit |
| chair-01.jpg | chair | ball | 20% | scanner | ball, drum, hammer |
| chair-02.jpg | chair | mirror | 80% | auto | mirror, chair, ladder |
| chair-04.jpg | chair | furniture | 54% | scanner | furniture, chair, glass |
| chair-05.jpg | chair | chair | 63% | auto | chair, recliner, seat belt |
| chair-07.jpg | chair | chair | 65% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | (not sure) | 6% | scanner |  |
| chair-10.jpg | chair | (not sure) | 10% | scanner |  |
| clock-01.jpg | clock | clock | 94% | auto | clock, honey, watch |
| clock-03.jpg | clock | clock | 85% | auto | clock, watch, drum |
| clock-04.jpg | clock | clock | 94% | auto | clock, watch, kitchen timer |
| clock-05.jpg | clock | clock | 48% | auto | clock, thermometer, watch |
| cup-01.jpg | cup | cup | 62% | auto | cup, can, mug |
| cup-03.jpg | cup | drink | 80% | scanner (blurry) | drink, juice, glass |
| dog-01.jpg | dog | dog | 50% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 87% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 70% | auto | dog leash, dog, hot dog |
| dog-07.jpg | dog | dog | 72% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 74% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 80% | auto | dog, dog leash, hot dog |
| dog-11.jpg | dog | dog | 81% | auto | dog, dog leash, hot dog |
| dog-12.jpg | dog | animal | 61% | auto | animal, dog, sandals |
| donut-01.jpg | donut | food | 73% | auto | food, donut, bagel |
| donut-02.jpg | donut | donut | 60% | auto | donut, carrot, bagel |
| fork-01.jpg | fork | fork | 87% | auto | fork, spoon, chopsticks |
| fridge-01.jpg | fridge | fridge | 48% | auto | fridge, freezer, shelf |
| fridge-04.jpg | fridge | fridge | 81% | auto | fridge, freezer, door |
| fridge-05.jpg | fridge | (not sure) | 8% | scanner |  |
| fridge-06.jpg | fridge | fridge | 71% | auto | fridge, freezer, blender |
| fridge-08.jpg | fridge | fridge | 27% | scanner | fridge, freezer, uniform |
| fridge-09.jpg | fridge | fridge | 79% | auto | fridge, freezer, blender |
| fridge-10.jpg | fridge | fridge | 59% | auto | fridge, can, freezer |
| fridge-12.jpg | fridge | fridge | 14% | scanner | fridge, chair, freezer |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, keys |
| keyboard-03.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, piano |
| knife-01.jpg | knife | knife | 96% | auto | knife, ball, spatula |
| knife-03.jpg | knife | fork | 88% | auto | fork, spoon, spatula |
| laptop-02.jpg | laptop | laptop | 84% | auto | laptop, notebook, monitor |
| laptop-03.jpg | laptop | keyboard | 51% | auto | keyboard, laptop, finger |
| laptop-04.jpg | laptop | (not sure) | 8% | scanner |  |
| laptop-05.jpg | laptop | laptop | 62% | auto | laptop, desk, notebook |
| laptop-06.jpg | laptop | laptop | 73% | auto | laptop, monitor, webcam |
| laptop-07.jpg | laptop | laptop | 56% | auto | laptop, keyboard, notebook |
| microwave-01.jpg | microwave | microwave | 64% | auto | microwave, honey, oven |
| microwave-02.jpg | microwave | microwave | 25% | scanner | microwave, glass, radio |
| orange-01.jpg | orange | fruit | 79% | auto | fruit, apple, orange |
| orange-02.jpg | orange | orange | 70% | auto | orange, lemon, pumpkin |
| oven-01.jpg | oven | oven | 17% | scanner | oven, bread, toaster |
| oven-02.jpg | oven | bread | 63% | auto | bread, bagel, pie |
| oven-04.jpg | oven | pizza | 72% | auto | pizza, pie, donut |
| oven-05.jpg | oven | rabbit | 18% | scanner | rabbit, cat, dog |
| oven-06.jpg | oven | stove | 13% | scanner | stove, oven, fridge |
| oven-07.jpg | oven | (not sure) | 8% | scanner |  |
| person-02.jpg | person | bandage | 12% | scanner (blurry) | bandage, face, head |
| person-04.jpg | person | watch | 12% | scanner | watch, phone, lighter |
| person-05.jpg | person | hat | 48% | auto | hat, tie, shirt |
| person-06.jpg | person | tie | 62% | auto | tie, suit, person |
| person-08.jpg | person | person | 67% | auto | person, mouth, toothbrush |
| person-09.jpg | person | child | 54% | auto | child, baby, corn |
| person-10.jpg | person | clothes | 53% | scanner | clothes, hat, teeth |
| person-12.jpg | person | clothes | 97% | auto | clothes, suit, skirt |
| phone-01.jpg | phone | (not sure) | 10% | scanner |  |
| phone-02.jpg | phone | car | 13% | scanner | car, razor, book |
| pizza-01.jpg | pizza | carrot | 15% | scanner | carrot, lettuce, peach |
| pizza-02.jpg | pizza | food | 60% | auto | food, pie, pizza |
| pizza-07.jpg | pizza | pizza | 54% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | carrot | 18% | scanner | carrot, glass, sweet potato |
| pizza-09.jpg | pizza | food | 78% | auto | food, pizza, glass |
| pizza-10.jpg | pizza | pizza | 45% | auto | pizza, pie, pancakes |
| pizza-11.jpg | pizza | honey | 13% | scanner | honey, orange, carrot |
| pizza-12.jpg | pizza | food | 53% | scanner | food, pie, pizza |
| plant-01.jpg | plant | flowers | 45% | scanner | flowers, flower, orange |
| plant-03.jpg | plant | plant | 59% | auto | plant, Christmas tree, tree |
| plant-04.jpg | plant | fence | 13% | scanner | fence, gate, mirror |
| remote-01.jpg | remote | remote | 37% | scanner | remote, eraser, knife |
| sandwich-01.jpg | sandwich | food | 66% | auto | food, sandwich, chicken |
| sandwich-02.jpg | sandwich | food | 84% | auto | food, bread, bagel |
| sandwich-04.jpg | sandwich | food | 87% | auto | food, hamburger, bagel |
| sandwich-05.jpg | sandwich | food | 59% | scanner (blurry) | food, bread, carrot |
| sandwich-06.jpg | sandwich | sandwich | 55% | auto | sandwich, cabbage, taco |
| sandwich-07.jpg | sandwich | food | 86% | auto | food, hot dog, pie |
| sandwich-08.jpg | sandwich | food | 51% | scanner | food, carrot, sandwich |
| sandwich-12.jpg | sandwich | food | 75% | auto | food, sandwich, glass |
| scissors-01.jpg | scissors | scissors | 95% | auto | scissors, knife, pliers |
| sink-01.jpg | sink | sink | 75% | auto | sink, soap, bathroom sink |
| sink-03.jpg | sink | (not sure) | 5% | scanner |  |
| sink-04.jpg | sink | (not sure) | 6% | scanner |  |
| sofa-01.jpg | sofa | cat | 27% | scanner | cat, dog, chair |
| sofa-03.jpg | sofa | plate | 14% | scanner | plate, pancakes, cup |
| sofa-04.jpg | sofa | cat | 95% | auto | cat, orange, lemon |
| sofa-05.jpg | sofa | furniture | 71% | auto | furniture, sofa, chair |
| sofa-06.jpg | sofa | sofa | 49% | auto | sofa, chair, bench |
| sofa-07.jpg | sofa | sofa | 76% | auto | sofa, chair, cushion |
| sofa-08.jpg | sofa | sofa | 88% | auto | sofa, cushion, chair |
| sofa-10.jpg | sofa | sofa | 69% | auto | sofa, blanket, chair |
| sofa-11.jpg | sofa | sofa | 80% | auto | sofa, chair, cushion |
| spoon-01.jpg | spoon | spoon | 93% | auto | spoon, hammer, spatula |
| spoon-02.jpg | spoon | spinach | 49% | auto | spinach, green beans, celery |
| suitcase-01.jpg | suitcase | suitcase | 44% | scanner | suitcase, seat belt, DVD |
| suitcase-02.jpg | suitcase | suitcase | 14% | scanner | suitcase, DVD, mailbox |
| suitcase-03.jpg | suitcase | (not sure) | 8% | scanner |  |
| suitcase-05.jpg | suitcase | suitcase | 81% | auto | suitcase, DVD, orange |
| teddy-bear-02.jpg | teddy bear | teddy bear | 66% | auto | teddy bear, toy, doll |
| teddy-bear-04.jpg | teddy bear | teddy bear | 95% | auto | teddy bear, carrot, doll |
| teddy-bear-05.jpg | teddy bear | teddy bear | 79% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 97% | auto | teddy bear, honey, orange |
| toaster-01.jpg | toaster | toaster | 96% | auto | toaster, lighter, kettle |
| toothbrush-01.jpg | toothbrush | toothbrush | 98% | auto | toothbrush, carrot, toothpaste |
| tv-01.jpg | tv | clothes | 54% | scanner | clothes, hat, person |
| tv-04.jpg | tv | monitor | 74% | auto | monitor, apple, tv |
| tv-05.jpg | tv | monitor | 49% | auto | monitor, bill, computer |
| tv-06.jpg | tv | tv | 70% | auto | tv, ball, monitor |
| tv-07.jpg | tv | tablet stand | 14% | scanner | tablet stand, monitor, webcam |
| tv-08.jpg | tv | monitor | 53% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | monitor | 52% | auto | monitor, ticket, computer |
| umbrella-01.jpg | umbrella | umbrella | 88% | auto | umbrella, balloon, kite |
| umbrella-02.jpg | umbrella | umbrella | 97% | auto | umbrella, swimsuit, kite |
| umbrella-03.jpg | umbrella | umbrella | 88% | auto | umbrella, tent, kite |
| umbrella-06.jpg | umbrella | umbrella | 75% | auto | umbrella, tent, Christmas tree |
| umbrella-07.jpg | umbrella | umbrella | 93% | auto | umbrella, tent, cane |
| umbrella-10.jpg | umbrella | umbrella | 94% | auto | umbrella, tent, kite |
| umbrella-11.jpg | umbrella | umbrella | 97% | auto | umbrella, rain, coat |
| umbrella-12.jpg | umbrella | chopsticks | 18% | scanner | chopsticks, envelope, rolling pin |
| vase-01.jpg | vase | horse | 92% | auto | horse, drum, book |
| vase-02.jpg | vase | glass | 52% | auto | glass, vase, orange |
| vase-04.jpg | vase | vase | 55% | auto | vase, glass, flowers |
| vizwiz-apple-00689.jpg | apple | fruit | 66% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | vegetable | 53% | scanner | vegetable, pumpkin, carrot |
| vizwiz-backpack-00499.jpg | backpack | clothes | 69% | auto | clothes, jacket, coat |
| vizwiz-bed-00316.jpg | bed | furniture | 61% | auto | furniture, bed, pillow |
| vizwiz-beer-00319.jpg | beer | can | 64% | auto | can, soda, can opener |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-box-00401.jpg | box | (not sure) | 10% | scanner |  |
| vizwiz-box-01128.jpg | box | (not sure) | 9% | scanner |  |
| vizwiz-cake-01066.jpg | cake | (not sure) | 4% | scanner |  |
| vizwiz-can-00840.jpg | can | (not sure) | 6% | scanner |  |
| vizwiz-can-01184.jpg | can | (not sure) | 4% | scanner |  |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 54% | auto | chair, shower chair, stool |
| vizwiz-coffee-00561.jpg | coffee | (not sure) | 12% | scanner |  |
| vizwiz-coffee-00937.jpg | coffee | mug | 45% | scanner | mug, cup, travel mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 8% | scanner |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | computer mouse | 19% | scanner (blurry) | computer mouse, flashlight, ball |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 16% | scanner | orange, carrot, soap |
| vizwiz-cookie-00772.jpg | cookie | (not sure) | 4% | scanner |  |
| vizwiz-corn-01008.jpg | corn | can | 31% | scanner | can, carrot, soda |
| vizwiz-crackers-00558.jpg | crackers | juice | 13% | scanner | juice, juice box, soap |
| vizwiz-cup-00247.jpg | cup | cup | 74% | scanner (blurry) | cup, bucket, coffee |
| vizwiz-cup-00857.jpg | cup | cup | 57% | auto | cup, mug, tea |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 7% | scanner |  |
| vizwiz-dog-00025.jpg | dog | coat | 14% | scanner | coat, dog, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 59% | auto | dog, dog leash, hot dog |
| vizwiz-door-00190.jpg | door | door | 15% | scanner (blurry) | door, door handle, shower |
| vizwiz-dresser-00569.jpg | dresser | drawer | 67% | auto | drawer, dresser, door handle |
| vizwiz-drying-rack-00329.jpg | drying rack | hanger | 17% | scanner | hanger, coat rack, umbrella |
| vizwiz-finger-00182.jpg | finger | person | 64% | auto | person, finger, hand |
| vizwiz-flower-00395.jpg | flower | flowers | 52% | auto | flowers, flower, carrot |
| vizwiz-foot-00080.jpg | foot | person | 61% | auto | person, leg, shoes |
| vizwiz-foot-01040.jpg | foot | person | 58% | scanner (blurry) | person, foot, leg |
| vizwiz-glass-00808.jpg | glass | glass | 47% | scanner (blurry) | glass, eye, jar |
| vizwiz-glass-00952.jpg | glass | person | 72% | auto | person, foot, hand |
| vizwiz-hair-00530.jpg | hair | person | 55% | scanner (blurry) | person, hair, head |
| vizwiz-heater-00502.jpg | heater | hand | 15% | scanner | hand, finger, leg |
| vizwiz-heater-01064.jpg | heater | radiator | 16% | scanner | radiator, heater, colander |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 4% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 46% | scanner (blurry) | jar, honey, peanut butter |
| vizwiz-juice-00422.jpg | juice | juice | 31% | scanner | juice, juice box, orange |
| vizwiz-ketchup-00112.jpg | ketchup | (not sure) | 9% | scanner |  |
| vizwiz-ketchup-00220.jpg | ketchup | (not sure) | 10% | scanner |  |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 14% | scanner | rope, keyboard, finger |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 17% | scanner | keyboard, piano, desk |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 92% | auto | keyboard, music keyboard, piano |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 6% | scanner |  |
| vizwiz-lotion-00026.jpg | lotion | lotion | 21% | scanner | lotion, soap, shampoo |
| vizwiz-lotion-01072.jpg | lotion | candle | 18% | scanner | candle, lighter, can |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 6% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | mailbox | 14% | scanner | mailbox, DVD, suitcase |
| vizwiz-medicine-00339.jpg | medicine | spoon | 12% | scanner | spoon, fork, pen |
| vizwiz-milk-00704.jpg | milk | beer | 31% | scanner (blurry) | beer, glue, urinal bottle |
| vizwiz-money-00473.jpg | money | money | 82% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 34% | scanner (blurry) | money, bill, paper |
| vizwiz-monitor-00663.jpg | monitor | pumpkin | 18% | scanner | pumpkin, orange, lemon |
| vizwiz-mug-00104.jpg | mug | mug | 48% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 20% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 33% | scanner (blurry) | paper, bill, envelope |
| vizwiz-pear-00245.jpg | pear | pear | 55% | auto | pear, avocado, lemon |
| vizwiz-pen-00570.jpg | pen | pen | 27% | scanner | pen, marker, pencil |
| vizwiz-phone-00274.jpg | phone | phone | 38% | scanner (blurry) | phone, flashlight, camera |
| vizwiz-phone-00562.jpg | phone | phone | 67% | auto | phone, DVD, remote |
| vizwiz-phone-01124.jpg | phone | phone | 41% | scanner | phone, DVD, finger |
| vizwiz-phone-01130.jpg | phone | phone | 45% | scanner (blurry) | phone, DVD, wallet |
| vizwiz-picture-00559.jpg | picture | photo frame | 43% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | person | 64% | auto | person, finger, hand |
| vizwiz-pills-01113.jpg | pills | (not sure) | 7% | scanner (blurry) |  |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 83% | auto | pumpkin, banana, ball |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 7% | scanner |  |
| vizwiz-radio-00642.jpg | radio | electronics | 58% | scanner | electronics, radio, toaster |
| vizwiz-remote-00012.jpg | remote | remote | 98% | auto | remote, calculator, dice |
| vizwiz-remote-00387.jpg | remote | remote | 97% | auto | remote, game controller, flashlight |
| vizwiz-remote-00439.jpg | remote | remote | 88% | auto | remote, lighter, fork |
| vizwiz-scissors-00315.jpg | scissors | tool | 99% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | (not sure) | 5% | scanner |  |
| vizwiz-shampoo-00631.jpg | shampoo | shampoo | 15% | scanner | shampoo, soap, conditioner |
| vizwiz-shaving-cream-00244.jpg | shaving cream | (not sure) | 7% | scanner |  |
| vizwiz-shaving-cream-00733.jpg | shaving cream | shaving cream | 65% | auto | shaving cream, lighter, deodorant |
| vizwiz-shoes-00005.jpg | shoes | person | 58% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 56% | auto | sink, hammer, bathroom sink |
| vizwiz-soap-00460.jpg | soap | shirt | 69% | auto | shirt, blanket, pajamas |
| vizwiz-soda-01042.jpg | soda | beer | 33% | scanner (blurry) | beer, urinal bottle, glass |
| vizwiz-soda-01207.jpg | soda | flashlight | 26% | scanner (blurry) | flashlight, finger, hand |
| vizwiz-soup-00995.jpg | soup | soup | 32% | scanner | soup, can, carrot |
| vizwiz-spinach-01009.jpg | spinach | can | 24% | scanner | can, cup, soup |
| vizwiz-spray-bottle-00364.jpg | spray bottle | (not sure) | 4% | scanner (blurry) |  |
| vizwiz-stairs-00699.jpg | stairs | stairs | 72% | auto | stairs, ladder, fence |
| vizwiz-stove-00678.jpg | stove | stove | 20% | scanner | stove, oven, pot |
| vizwiz-sugar-00134.jpg | sugar | lighter | 6% | scanner | lighter, juice, soap |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 10% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 44% | scanner | tissues, juice, box |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 93% | auto | toilet paper, paper, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 7% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 31% | scanner | flashlight, lamp, tablet stand |
| vizwiz-water-00659.jpg | water | flashlight | 30% | scanner (blurry) | flashlight, straw, beer |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 61% | auto | water bottle, urinal bottle, baby bottle |
| vizwiz-wine-00669.jpg | wine | beer | 30% | scanner | beer, soap, honey |
| vizwiz-wine-00946.jpg | wine | (not sure) | 10% | scanner (blurry) |  |
| vizwiz-wine-01068.jpg | wine | beer | 22% | scanner | beer, flashlight, glass |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 76% | auto | glass, wine glass, wine |
| vizwiz-yogurt-01051.jpg | yogurt | (not sure) | 4% | scanner |  |
| water-bottle-01.jpg | water bottle | lime | 16% | scanner | lime, water bottle, hand |
| wine-glass-02.jpg | wine glass | wine | 51% | auto | wine, glass, glasses |

### test-images-public/dev-ring-wifi, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 46% | 61% | 55% | 13% | 13% | 11% | 121 / 210 | 156 | vocab 246, none 31 |
| coco | 172 | 52% | 67% | 70% | 16% | 13% | 5% | 109 / 209 | 144 | vocab 163, none 9 |
| cluttered | 131 | 48% | 63% | 69% | 18% | 15% | 4% | 110 / 209 | 146 | vocab 126, none 5 |
| fruit | 12 | 58% | 83% | 83% | 8% | 33% | 0% | 123 / 255 | 213 | vocab 12 |
| ring-wifi | 277 | 46% | 61% | 55% | 13% | 13% | 11% | 121 / 210 | 156 | vocab 246, none 31 |
| clothes & accessories | 11 | 73% | 73% | 82% | 0% | 9% | 0% | 100 / 229 | 136 | vocab 11 |
| table | 41 | 66% | 78% | 73% | 10% | 7% | 10% | 107 / 162 | 139 | vocab 37, none 4 |
| single | 41 | 66% | 78% | 73% | 10% | 7% | 10% | 107 / 162 | 139 | vocab 37, none 4 |
| furniture & home | 48 | 40% | 60% | 63% | 21% | 13% | 15% | 108 / 209 | 139 | none 7, vocab 41 |
| office & reading | 5 | 40% | 40% | 0% | 0% | 0% | 20% | 113 / 123 | 145 | vocab 4, none 1 |
| kitchen & dining | 46 | 54% | 61% | 57% | 22% | 0% | 9% | 110 / 208 | 142 | vocab 42, none 4 |
| vegetables | 7 | 57% | 71% | 71% | 0% | 14% | 0% | 98 / 221 | 130 | vocab 7 |
| food & meals | 34 | 24% | 47% | 44% | 0% | 44% | 12% | 142 / 214 | 173 | vocab 30, none 4 |
| pets & animals | 18 | 78% | 100% | 94% | 11% | 6% | 0% | 77 / 159 | 108 | vocab 18 |
| electronics & media | 28 | 54% | 75% | 64% | 21% | 4% | 0% | 127 / 210 | 162 | vocab 28 |
| people & body | 12 | 8% | 50% | 58% | 33% | 42% | 8% | 132 / 181 | 164 | vocab 11, none 1 |
| personal items | 13 | 69% | 69% | 23% | 0% | 0% | 23% | 129 / 162 | 162 | none 3, vocab 10 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 33% | 102 / 157 | 136 | vocab 2, none 1 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 126 / 154 | 162 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 46% | 46% | 31% | 8% | 0% | 31% | 154 / 213 | 191 | vocab 9, none 4 |
| held | 105 | 35% | 51% | 29% | 8% | 11% | 21% | 140 / 213 | 176 | vocab 83, none 22 |
| vizwiz | 105 | 35% | 51% | 29% | 8% | 11% | 21% | 140 / 213 | 176 | vocab 83, none 22 |
| drinks | 16 | 19% | 25% | 6% | 6% | 0% | 19% | 163 / 227 | 199 | vocab 13, none 3 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 50% | 128 / 129 | 161 | vocab 1, none 1 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 152 / 152 | 185 | vocab 1 |
| health & medical | 3 | 0% | 0% | 0% | 0% | 0% | 33% | 172 / 213 | 206 | vocab 2, none 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 55% | auto | apple, peach, pear |
| apple-03.jpg | apple | fruit | 98% | scanner (blurry) | fruit, apple, pear |
| backpack-01.jpg | backpack | backpack | 92% | auto | backpack, jacket, purse |
| banana-01.jpg | banana | banana | 41% | scanner (blurry) | banana, face, finger |
| banana-02.jpg | banana | banana | 89% | auto | banana, corn, lemon |
| banana-04.jpg | banana | banana | 48% | auto | banana, pear, apple |
| banana-05.jpg | banana | banana | 67% | auto | banana, Christmas tree, tree |
| banana-06.jpg | banana | banana | 47% | auto | banana, corn, Christmas tree |
| bed-01.jpg | bed | (not sure) | 5% | scanner |  |
| bed-03.jpg | bed | book | 16% | scanner | book, chopsticks, soap |
| bed-04.jpg | bed | blanket | 56% | auto | blanket, bedpan, coat |
| bed-05.jpg | bed | furniture | 77% | auto | furniture, bed, bedpan |
| bed-06.jpg | bed | curtains | 76% | auto | curtains, umbrella, tent |
| bed-09.jpg | bed | furniture | 67% | auto | furniture, blanket, sheets |
| bed-10.jpg | bed | bicycle | 93% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 48% | auto | blanket, sheets, bedpan |
| bed-12.jpg | bed | furniture | 50% | scanner | furniture, bed, blanket |
| book-01.jpg | book | dog | 25% | scanner | dog, hot dog, rabbit |
| book-02.jpg | book | crayons | 30% | scanner | crayons, chopsticks, pencil |
| bowl-01.jpg | bowl | broccoli | 58% | auto | broccoli, spinach, carrot |
| bowl-02.jpg | bowl | food | 63% | auto | food, pasta, broccoli |
| bowl-04.jpg | bowl | soup | 62% | auto | soup, carrot, chopsticks |
| bowl-05.jpg | bowl | food | 53% | scanner | food, pie, carrot |
| bowl-07.jpg | bowl | banana | 12% | scanner | banana, lemon, carrot |
| bowl-09.jpg | bowl | plate | 13% | scanner | plate, bowl, soup |
| bowl-10.jpg | bowl | vegetable | 53% | scanner | vegetable, carrot, peas |
| bowl-12.jpg | bowl | food | 50% | scanner | food, pasta, soap |
| broccoli-01.jpg | broccoli | broccoli | 94% | auto | broccoli, cauliflower, cabbage |
| broccoli-03.jpg | broccoli | vegetable | 69% | auto | vegetable, broccoli, strawberry |
| cake-01.jpg | cake | food | 93% | scanner (blurry) | food, cake, cupcake |
| cake-02.jpg | cake | cake | 90% | auto | cake, cupcake, flowers |
| cake-03.jpg | cake | cake | 80% | auto | cake, peas, cupcake |
| cake-05.jpg | cake | mop | 13% | scanner | mop, blanket, rope |
| cake-07.jpg | cake | food | 76% | auto | food, bread, bagel |
| carrot-01.jpg | carrot | carrot | 92% | auto | carrot, corn, sweet potato |
| carrot-02.jpg | carrot | carrot | 96% | auto | carrot, orange, sweet potato |
| carrot-03.jpg | carrot | carrot | 100% | auto | carrot, sweet potato, corn |
| cat-01.jpg | cat | cat | 46% | auto | cat, rabbit, squirrel |
| cat-02.jpg | cat | cat | 86% | auto | cat, rabbit, orange |
| cat-03.jpg | cat | cat | 80% | auto | cat, eye, hat |
| cat-05.jpg | cat | bird | 65% | auto | bird, squirrel, cat |
| cat-07.jpg | cat | cat | 65% | auto | cat, rabbit, dog |
| cat-10.jpg | cat | cat | 99% | auto | cat, squirrel, book |
| cat-11.jpg | cat | cat | 99% | auto | cat, squirrel, rabbit |
| cat-12.jpg | cat | cat | 81% | auto | cat, squirrel, rabbit |
| chair-01.jpg | chair | chair | 18% | scanner | chair, ball, stool |
| chair-02.jpg | chair | mirror | 90% | auto | mirror, chair, photo frame |
| chair-04.jpg | chair | chair | 55% | auto | chair, seat belt, recliner |
| chair-05.jpg | chair | chair | 50% | auto | chair, recliner, seat belt |
| chair-07.jpg | chair | chair | 71% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | (not sure) | 10% | scanner |  |
| chair-10.jpg | chair | (not sure) | 8% | scanner |  |
| clock-01.jpg | clock | clock | 94% | auto | clock, honey, watch |
| clock-03.jpg | clock | clock | 75% | auto | clock, watch, fork |
| clock-04.jpg | clock | clock | 92% | auto | clock, watch, kitchen timer |
| clock-05.jpg | clock | clock | 53% | auto | clock, watch, thermometer |
| cup-01.jpg | cup | cup | 62% | auto | cup, can, mug |
| cup-03.jpg | cup | drink | 58% | scanner (blurry) | drink, juice, glass |
| dog-01.jpg | dog | dog | 60% | auto | dog, hot dog, dog leash |
| dog-02.jpg | dog | dog | 87% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 82% | auto | dog leash, dog, hot dog |
| dog-07.jpg | dog | dog | 75% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 72% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 83% | auto | dog, hot dog, dog leash |
| dog-11.jpg | dog | dog | 68% | auto | dog, hot dog, dog leash |
| dog-12.jpg | dog | animal | 61% | auto | animal, dog, sandals |
| donut-01.jpg | donut | food | 73% | auto | food, donut, bagel |
| donut-02.jpg | donut | donut | 60% | auto | donut, carrot, bagel |
| fork-01.jpg | fork | fork | 88% | auto | fork, spoon, chopsticks |
| fridge-01.jpg | fridge | fridge | 55% | auto | fridge, freezer, shelf |
| fridge-04.jpg | fridge | fridge | 81% | auto | fridge, freezer, door |
| fridge-05.jpg | fridge | fridge | 14% | scanner | fridge, door, freezer |
| fridge-06.jpg | fridge | fridge | 77% | auto | fridge, freezer, blender |
| fridge-08.jpg | fridge | fridge | 27% | scanner | fridge, freezer, uniform |
| fridge-09.jpg | fridge | fridge | 79% | auto | fridge, freezer, blender |
| fridge-10.jpg | fridge | fridge | 59% | auto | fridge, freezer, juice |
| fridge-12.jpg | fridge | fridge | 14% | scanner | fridge, chair, freezer |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, computer mouse |
| keyboard-03.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, computer mouse |
| knife-01.jpg | knife | knife | 96% | auto | knife, ball, spatula |
| knife-03.jpg | knife | fork | 92% | auto | fork, spoon, chopsticks |
| laptop-02.jpg | laptop | keyboard | 58% | auto | keyboard, laptop, monitor |
| laptop-03.jpg | laptop | laptop | 83% | auto | laptop, envelope, notebook |
| laptop-04.jpg | laptop | phone charger | 15% | scanner | phone charger, charging cable, laptop |
| laptop-05.jpg | laptop | laptop | 62% | auto | laptop, desk, notebook |
| laptop-06.jpg | laptop | laptop | 73% | auto | laptop, monitor, webcam |
| laptop-07.jpg | laptop | laptop | 56% | auto | laptop, keyboard, notebook |
| microwave-01.jpg | microwave | microwave | 64% | auto | microwave, honey, oven |
| microwave-02.jpg | microwave | microwave | 25% | scanner | microwave, glass, radio |
| orange-01.jpg | orange | fruit | 72% | auto | fruit, orange, apple |
| orange-02.jpg | orange | orange | 80% | auto | orange, lemon, carrot |
| oven-01.jpg | oven | oven | 17% | scanner | oven, bread, toaster |
| oven-02.jpg | oven | bread | 63% | auto | bread, bagel, pie |
| oven-04.jpg | oven | pizza | 61% | auto | pizza, pie, pancakes |
| oven-05.jpg | oven | rabbit | 18% | scanner | rabbit, cat, dog |
| oven-06.jpg | oven | stove | 47% | auto | stove, oven, toaster |
| oven-07.jpg | oven | (not sure) | 8% | scanner |  |
| person-02.jpg | person | bandage | 12% | scanner (blurry) | bandage, face, head |
| person-04.jpg | person | (not sure) | 12% | scanner |  |
| person-05.jpg | person | hat | 48% | auto | hat, tie, shirt |
| person-06.jpg | person | tie | 53% | auto | tie, person, face |
| person-08.jpg | person | person | 64% | auto | person, mouth, toothbrush |
| person-09.jpg | person | child | 67% | auto | child, baby, corn |
| person-10.jpg | person | clothes | 53% | scanner | clothes, hat, mouth |
| person-12.jpg | person | clothes | 87% | auto | clothes, skirt, suit |
| phone-01.jpg | phone | (not sure) | 10% | scanner |  |
| phone-02.jpg | phone | remote | 13% | scanner | remote, car, lighter |
| pizza-01.jpg | pizza | carrot | 13% | scanner | carrot, lettuce, bacon |
| pizza-02.jpg | pizza | food | 60% | auto | food, pie, pizza |
| pizza-07.jpg | pizza | pizza | 54% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | food | 55% | scanner | food, bacon, glass |
| pizza-09.jpg | pizza | food | 77% | auto | food, pie, pizza |
| pizza-10.jpg | pizza | pizza | 46% | auto | pizza, pie, pasta |
| pizza-11.jpg | pizza | food | 52% | scanner | food, honey, orange |
| pizza-12.jpg | pizza | food | 50% | scanner | food, pie, carrot |
| plant-01.jpg | plant | flowers | 64% | auto | flowers, flower, orange |
| plant-03.jpg | plant | plant | 59% | auto | plant, Christmas tree, tree |
| plant-04.jpg | plant | fence | 13% | scanner | fence, Christmas tree, chopsticks |
| remote-01.jpg | remote | remote | 37% | scanner | remote, eraser, knife |
| sandwich-01.jpg | sandwich | food | 67% | auto | food, sandwich, carrot |
| sandwich-02.jpg | sandwich | food | 50% | scanner | food, bread, bagel |
| sandwich-04.jpg | sandwich | food | 87% | auto | food, hamburger, pie |
| sandwich-05.jpg | sandwich | food | 63% | scanner (blurry) | food, bread, toast |
| sandwich-06.jpg | sandwich | sandwich | 55% | auto | sandwich, cabbage, taco |
| sandwich-07.jpg | sandwich | food | 86% | auto | food, hot dog, pie |
| sandwich-08.jpg | sandwich | carrot | 19% | scanner | carrot, taco, burrito |
| sandwich-12.jpg | sandwich | food | 79% | auto | food, sandwich, glass |
| scissors-01.jpg | scissors | scissors | 91% | auto | scissors, knife, pliers |
| sink-01.jpg | sink | sink | 75% | auto | sink, cup, bathroom sink |
| sink-03.jpg | sink | (not sure) | 6% | scanner |  |
| sink-04.jpg | sink | (not sure) | 2% | scanner |  |
| sofa-01.jpg | sofa | cat | 27% | scanner | cat, chair, sofa |
| sofa-03.jpg | sofa | cup | 33% | scanner | cup, can, mug |
| sofa-04.jpg | sofa | cat | 91% | auto | cat, orange, spoon |
| sofa-05.jpg | sofa | furniture | 71% | auto | furniture, sofa, chair |
| sofa-06.jpg | sofa | sofa | 49% | auto | sofa, chair, bench |
| sofa-07.jpg | sofa | sofa | 62% | auto | sofa, chair, cushion |
| sofa-08.jpg | sofa | sofa | 87% | auto | sofa, chair, cushion |
| sofa-10.jpg | sofa | sofa | 69% | auto | sofa, corn, chair |
| sofa-11.jpg | sofa | sofa | 80% | auto | sofa, chair, cushion |
| spoon-01.jpg | spoon | spoon | 93% | auto | spoon, chopsticks, spatula |
| spoon-02.jpg | spoon | vegetable | 67% | auto | vegetable, spinach, green beans |
| suitcase-01.jpg | suitcase | suitcase | 44% | scanner | suitcase, seat belt, DVD |
| suitcase-02.jpg | suitcase | suitcase | 14% | scanner | suitcase, DVD, mailbox |
| suitcase-03.jpg | suitcase | (not sure) | 8% | scanner |  |
| suitcase-05.jpg | suitcase | suitcase | 61% | auto | suitcase, DVD, orange |
| teddy-bear-02.jpg | teddy bear | teddy bear | 78% | auto | teddy bear, eye, toy |
| teddy-bear-04.jpg | teddy bear | teddy bear | 95% | auto | teddy bear, carrot, doll |
| teddy-bear-05.jpg | teddy bear | teddy bear | 79% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 96% | auto | teddy bear, honey, doll |
| toaster-01.jpg | toaster | toaster | 95% | auto | toaster, knife, kettle |
| toothbrush-01.jpg | toothbrush | toothbrush | 98% | auto | toothbrush, carrot, toothpaste |
| tv-01.jpg | tv | clothes | 56% | scanner | clothes, hat, coat |
| tv-04.jpg | tv | monitor | 74% | auto | monitor, apple, tv |
| tv-05.jpg | tv | monitor | 61% | auto | monitor, paper, computer |
| tv-06.jpg | tv | tv | 70% | auto | tv, ball, monitor |
| tv-07.jpg | tv | tablet stand | 13% | scanner | tablet stand, monitor, webcam |
| tv-08.jpg | tv | monitor | 53% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | monitor | 52% | auto | monitor, ticket, computer |
| umbrella-01.jpg | umbrella | umbrella | 81% | auto | umbrella, balloon, kite |
| umbrella-02.jpg | umbrella | umbrella | 75% | auto | umbrella, kite, swimsuit |
| umbrella-03.jpg | umbrella | umbrella | 82% | auto | umbrella, kite, tent |
| umbrella-06.jpg | umbrella | umbrella | 50% | auto | umbrella, tent, Christmas tree |
| umbrella-07.jpg | umbrella | umbrella | 93% | auto | umbrella, tent, cane |
| umbrella-10.jpg | umbrella | umbrella | 96% | auto | umbrella, tent, kite |
| umbrella-11.jpg | umbrella | umbrella | 97% | auto | umbrella, rain, coat |
| umbrella-12.jpg | umbrella | chopsticks | 20% | scanner | chopsticks, envelope, pen |
| vase-01.jpg | vase | horse | 93% | auto | horse, drum, book |
| vase-02.jpg | vase | glass | 52% | auto | glass, vase, orange |
| vase-04.jpg | vase | vase | 55% | auto | vase, glass, flowers |
| vizwiz-apple-00689.jpg | apple | fruit | 66% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | vegetable | 53% | scanner | vegetable, pumpkin, carrot |
| vizwiz-backpack-00499.jpg | backpack | clothes | 69% | auto | clothes, jacket, coat |
| vizwiz-bed-00316.jpg | bed | furniture | 61% | auto | furniture, bed, pillow |
| vizwiz-beer-00319.jpg | beer | can | 64% | auto | can, soda, can opener |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-box-00401.jpg | box | (not sure) | 10% | scanner |  |
| vizwiz-box-01128.jpg | box | (not sure) | 9% | scanner |  |
| vizwiz-cake-01066.jpg | cake | (not sure) | 4% | scanner |  |
| vizwiz-can-00840.jpg | can | (not sure) | 6% | scanner |  |
| vizwiz-can-01184.jpg | can | can | 13% | scanner | can, book, cup |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 54% | auto | chair, shower chair, stool |
| vizwiz-coffee-00561.jpg | coffee | jar | 12% | scanner | jar, glass, honey |
| vizwiz-coffee-00937.jpg | coffee | mug | 45% | scanner | mug, cup, travel mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 8% | scanner |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | computer mouse | 19% | scanner (blurry) | computer mouse, flashlight, ball |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | orange | 16% | scanner | orange, carrot, soap |
| vizwiz-cookie-00772.jpg | cookie | food | 65% | auto | food, cookie, bread |
| vizwiz-corn-01008.jpg | corn | can | 31% | scanner | can, carrot, soda |
| vizwiz-crackers-00558.jpg | crackers | person | 59% | scanner | person, hand, finger |
| vizwiz-cup-00247.jpg | cup | cup | 74% | scanner (blurry) | cup, bucket, coffee |
| vizwiz-cup-00857.jpg | cup | mug | 51% | auto | mug, cup, tea |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 7% | scanner |  |
| vizwiz-dog-00025.jpg | dog | coat | 14% | scanner | coat, dog, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 59% | auto | dog, dog leash, hot dog |
| vizwiz-door-00190.jpg | door | door | 15% | scanner (blurry) | door, door handle, shower |
| vizwiz-dresser-00569.jpg | dresser | drawer | 71% | auto | drawer, dresser, door handle |
| vizwiz-drying-rack-00329.jpg | drying rack | hanger | 17% | scanner | hanger, coat rack, umbrella |
| vizwiz-finger-00182.jpg | finger | person | 81% | auto | person, finger, hand |
| vizwiz-flower-00395.jpg | flower | flowers | 49% | auto | flowers, flower, flower pot |
| vizwiz-foot-00080.jpg | foot | person | 61% | auto | person, leg, foot |
| vizwiz-foot-01040.jpg | foot | person | 58% | scanner (blurry) | person, foot, leg |
| vizwiz-glass-00808.jpg | glass | glass | 46% | scanner (blurry) | glass, jar, cup |
| vizwiz-glass-00952.jpg | glass | person | 72% | auto | person, foot, hand |
| vizwiz-hair-00530.jpg | hair | person | 55% | scanner (blurry) | person, hair, head |
| vizwiz-heater-00502.jpg | heater | furniture | 50% | scanner | furniture, dresser, hand |
| vizwiz-heater-01064.jpg | heater | radiator | 16% | scanner | radiator, heater, colander |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 4% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 46% | scanner (blurry) | jar, honey, peanut butter |
| vizwiz-juice-00422.jpg | juice | juice | 31% | scanner | juice, juice box, orange |
| vizwiz-ketchup-00112.jpg | ketchup | ketchup | 19% | scanner | ketchup, soap, tomato |
| vizwiz-ketchup-00220.jpg | ketchup | (not sure) | 4% | scanner |  |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 97% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 93% | auto | keyboard, music keyboard, keys |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 14% | scanner | rope, keyboard, finger |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 17% | scanner | keyboard, piano, desk |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 92% | auto | keyboard, music keyboard, piano |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 4% | scanner |  |
| vizwiz-lotion-00026.jpg | lotion | lotion | 21% | scanner | lotion, soap, shampoo |
| vizwiz-lotion-01072.jpg | lotion | cup | 19% | scanner | cup, candle, carrot |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | (not sure) | 6% | scanner |  |
| vizwiz-mailbox-00117.jpg | mailbox | mailbox | 14% | scanner | mailbox, DVD, suitcase |
| vizwiz-medicine-00339.jpg | medicine | spoon | 12% | scanner | spoon, fork, pen |
| vizwiz-milk-00704.jpg | milk | beer | 31% | scanner (blurry) | beer, glue, urinal bottle |
| vizwiz-money-00473.jpg | money | money | 82% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | money | 34% | scanner (blurry) | money, bill, paper |
| vizwiz-monitor-00663.jpg | monitor | pumpkin | 18% | scanner | pumpkin, orange, lemon |
| vizwiz-mug-00104.jpg | mug | mug | 48% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 20% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 33% | scanner (blurry) | paper, bill, envelope |
| vizwiz-pear-00245.jpg | pear | fruit | 85% | auto | fruit, pear, finger |
| vizwiz-pen-00570.jpg | pen | pen | 27% | scanner | pen, marker, pencil |
| vizwiz-phone-00274.jpg | phone | phone | 48% | scanner (blurry) | phone, flashlight, lighter |
| vizwiz-phone-00562.jpg | phone | phone | 63% | auto | phone, DVD, remote |
| vizwiz-phone-01124.jpg | phone | phone | 41% | scanner | phone, DVD, finger |
| vizwiz-phone-01130.jpg | phone | phone | 34% | scanner (blurry) | phone, DVD, remote |
| vizwiz-picture-00559.jpg | picture | photo frame | 33% | scanner | photo frame, blanket, picture |
| vizwiz-pill-bottle-00089.jpg | pill bottle | lime | 20% | scanner | lime, finger, lighter |
| vizwiz-pills-01113.jpg | pills | (not sure) | 7% | scanner (blurry) |  |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 83% | auto | pumpkin, banana, ball |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 7% | scanner |  |
| vizwiz-radio-00642.jpg | radio | electronics | 58% | scanner | electronics, radio, toaster |
| vizwiz-remote-00012.jpg | remote | remote | 98% | auto | remote, calculator, dice |
| vizwiz-remote-00387.jpg | remote | remote | 97% | auto | remote, game controller, flashlight |
| vizwiz-remote-00439.jpg | remote | remote | 94% | auto | remote, spatula, knife |
| vizwiz-scissors-00315.jpg | scissors | tool | 99% | scanner (blurry) | tool, scissors, knife |
| vizwiz-shampoo-00096.jpg | shampoo | (not sure) | 5% | scanner |  |
| vizwiz-shampoo-00631.jpg | shampoo | shampoo | 15% | scanner | shampoo, soap, conditioner |
| vizwiz-shaving-cream-00244.jpg | shaving cream | (not sure) | 7% | scanner |  |
| vizwiz-shaving-cream-00733.jpg | shaving cream | shaving cream | 65% | auto | shaving cream, lighter, deodorant |
| vizwiz-shoes-00005.jpg | shoes | person | 58% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 56% | auto | sink, hammer, bathroom sink |
| vizwiz-soap-00460.jpg | soap | shirt | 69% | auto | shirt, blanket, pajamas |
| vizwiz-soda-01042.jpg | soda | beer | 33% | scanner (blurry) | beer, flashlight, urinal bottle |
| vizwiz-soda-01207.jpg | soda | flashlight | 26% | scanner (blurry) | flashlight, finger, hand |
| vizwiz-soup-00995.jpg | soup | soup | 32% | scanner | soup, can, carrot |
| vizwiz-spinach-01009.jpg | spinach | can | 24% | scanner | can, cup, soup |
| vizwiz-spray-bottle-00364.jpg | spray bottle | (not sure) | 4% | scanner (blurry) |  |
| vizwiz-stairs-00699.jpg | stairs | stairs | 72% | auto | stairs, ladder, fence |
| vizwiz-stove-00678.jpg | stove | stove | 20% | scanner | stove, oven, pot |
| vizwiz-sugar-00134.jpg | sugar | lighter | 6% | scanner | lighter, juice, soap |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 10% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 44% | scanner | tissues, juice, box |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 93% | auto | toilet paper, paper, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 7% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 31% | scanner | flashlight, lamp, tablet stand |
| vizwiz-water-00659.jpg | water | flashlight | 30% | scanner (blurry) | flashlight, straw, beer |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 22% | scanner | water bottle, urinal bottle, baby bottle |
| vizwiz-wine-00669.jpg | wine | beer | 30% | scanner | beer, honey, urinal bottle |
| vizwiz-wine-00946.jpg | wine | (not sure) | 10% | scanner (blurry) |  |
| vizwiz-wine-01068.jpg | wine | beer | 22% | scanner | beer, flashlight, glass |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 76% | auto | glass, wine glass, wine |
| vizwiz-yogurt-01051.jpg | yogurt | (not sure) | 4% | scanner |  |
| water-bottle-01.jpg | water bottle | lime | 16% | scanner | lime, money, water bottle |
| wine-glass-02.jpg | wine glass | glass | 46% | auto | glass, wine glass, wine |

### test-images-public/dev-ring-ble, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 43% | 58% | 50% | 12% | 11% | 17% | 112 / 179 | 142 | vocab 229, none 48 |
| coco | 172 | 48% | 65% | 64% | 15% | 13% | 11% | 116 / 200 | 147 | vocab 153, none 19 |
| cluttered | 131 | 44% | 61% | 63% | 17% | 15% | 10% | 120 / 204 | 150 | vocab 118, none 13 |
| fruit | 12 | 58% | 83% | 75% | 8% | 25% | 0% | 135 / 271 | 168 | vocab 12 |
| ring-ble | 277 | 43% | 58% | 50% | 12% | 11% | 17% | 112 / 179 | 142 | vocab 229, none 48 |
| clothes & accessories | 11 | 73% | 73% | 82% | 0% | 9% | 0% | 87 / 153 | 117 | vocab 11 |
| table | 41 | 63% | 76% | 66% | 7% | 7% | 15% | 106 / 156 | 136 | vocab 35, none 6 |
| single | 41 | 63% | 76% | 66% | 7% | 7% | 15% | 106 / 156 | 136 | vocab 35, none 6 |
| furniture & home | 48 | 40% | 54% | 54% | 15% | 6% | 19% | 114 / 200 | 144 | vocab 39, none 9 |
| office & reading | 5 | 60% | 60% | 0% | 0% | 0% | 20% | 88 / 142 | 121 | none 1, vocab 4 |
| kitchen & dining | 46 | 37% | 50% | 46% | 22% | 0% | 24% | 119 / 197 | 150 | vocab 35, none 11 |
| vegetables | 7 | 57% | 86% | 71% | 14% | 0% | 14% | 96 / 155 | 126 | vocab 6, none 1 |
| food & meals | 34 | 21% | 50% | 50% | 6% | 35% | 21% | 126 / 176 | 156 | vocab 27, none 7 |
| pets & animals | 18 | 83% | 100% | 83% | 6% | 11% | 0% | 90 / 179 | 119 | vocab 18 |
| electronics & media | 28 | 46% | 61% | 50% | 14% | 11% | 4% | 111 / 178 | 140 | vocab 27, none 1 |
| people & body | 12 | 17% | 58% | 58% | 42% | 42% | 8% | 109 / 153 | 138 | vocab 11, none 1 |
| personal items | 13 | 62% | 62% | 23% | 0% | 0% | 31% | 103 / 126 | 133 | none 4, vocab 9 |
| tools & household | 3 | 67% | 67% | 67% | 0% | 0% | 33% | 79 / 110 | 107 | vocab 2, none 1 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 112 / 116 | 141 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 23% | 38% | 15% | 0% | 0% | 54% | 103 / 153 | 133 | vocab 6, none 7 |
| held | 105 | 33% | 48% | 28% | 8% | 8% | 28% | 104 / 153 | 134 | vocab 76, none 29 |
| vizwiz | 105 | 33% | 48% | 28% | 8% | 8% | 28% | 104 / 153 | 134 | vocab 76, none 29 |
| drinks | 16 | 31% | 38% | 19% | 6% | 6% | 13% | 116 / 181 | 145 | vocab 14, none 2 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 50% | 104 / 125 | 132 | vocab 1, none 1 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 108 / 108 | 137 | vocab 1 |
| health & medical | 3 | 0% | 0% | 33% | 33% | 0% | 33% | 131 / 154 | 161 | none 1, vocab 2 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | fruit | 84% | auto | fruit, apple, peach |
| apple-03.jpg | apple | apple | 74% | auto | apple, pear, plum |
| backpack-01.jpg | backpack | backpack | 73% | auto | backpack, blanket, purse |
| banana-01.jpg | banana | banana | 12% | scanner | banana, bagel, person |
| banana-02.jpg | banana | banana | 88% | auto | banana, lemon, corn |
| banana-04.jpg | banana | banana | 79% | auto | banana, mango, pear |
| banana-05.jpg | banana | banana | 68% | auto | banana, Christmas tree, tree |
| banana-06.jpg | banana | vegetable | 51% | scanner | vegetable, banana, carrot |
| bed-01.jpg | bed | remote | 24% | scanner | remote, cup, book |
| bed-03.jpg | bed | (not sure) | 5% | scanner |  |
| bed-04.jpg | bed | blanket | 13% | scanner | blanket, coat, shirt |
| bed-05.jpg | bed | bed | 46% | auto | bed, bedpan, sheets |
| bed-06.jpg | bed | curtains | 46% | auto | curtains, tent, umbrella |
| bed-09.jpg | bed | furniture | 66% | auto | furniture, blanket, bedpan |
| bed-10.jpg | bed | bicycle | 95% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 27% | scanner | blanket, bedpan, bed |
| bed-12.jpg | bed | bed | 13% | scanner | bed, bedpan, bench |
| book-01.jpg | book | (not sure) | 3% | scanner |  |
| book-02.jpg | book | crayons | 39% | scanner | crayons, shelf, chopsticks |
| bowl-01.jpg | bowl | vegetable | 76% | auto | vegetable, broccoli, soup |
| bowl-02.jpg | bowl | pasta | 57% | auto | pasta, noodles, broccoli |
| bowl-04.jpg | bowl | soup | 65% | auto | soup, carrot, chopsticks |
| bowl-05.jpg | bowl | food | 63% | auto | food, pie, carrot |
| bowl-07.jpg | bowl | lemon | 34% | scanner | lemon, carrot, orange |
| bowl-09.jpg | bowl | plate | 16% | scanner | plate, sausage, soup |
| bowl-10.jpg | bowl | carrot | 29% | scanner | carrot, soup, bowl |
| bowl-12.jpg | bowl | food | 54% | scanner | food, pasta, soup |
| broccoli-01.jpg | broccoli | broccoli | 51% | auto | broccoli, corn, cauliflower |
| broccoli-03.jpg | broccoli | strawberry | 50% | auto | strawberry, broccoli, pear |
| cake-01.jpg | cake | food | 90% | scanner (blurry) | food, cake, cupcake |
| cake-02.jpg | cake | cake | 67% | auto | cake, flowers, cupcake |
| cake-03.jpg | cake | cake | 78% | auto | cake, peas, cupcake |
| cake-05.jpg | cake | (not sure) | 12% | scanner |  |
| cake-07.jpg | cake | food | 83% | auto | food, bagel, bread |
| carrot-01.jpg | carrot | carrot | 94% | auto | carrot, corn, peeler |
| carrot-02.jpg | carrot | carrot | 77% | auto | carrot, sweet potato, sausage |
| carrot-03.jpg | carrot | carrot | 99% | auto | carrot, sweet potato, corn |
| cat-01.jpg | cat | cat | 98% | auto | cat, book, orange |
| cat-02.jpg | cat | cat | 96% | auto | cat, orange, lemon |
| cat-03.jpg | cat | cat | 82% | auto | cat, hat, orange |
| cat-05.jpg | cat | animal | 62% | auto | animal, rabbit, cat |
| cat-07.jpg | cat | cat | 47% | scanner | cat, glass, cup |
| cat-10.jpg | cat | cat | 99% | auto | cat, squirrel, book |
| cat-11.jpg | cat | cat | 97% | auto | cat, squirrel, rabbit |
| cat-12.jpg | cat | cat | 73% | auto | cat, squirrel, rabbit |
| chair-01.jpg | chair | (not sure) | 6% | scanner |  |
| chair-02.jpg | chair | mirror | 69% | auto | mirror, chair, door |
| chair-04.jpg | chair | chair | 49% | auto | chair, high chair, recliner |
| chair-05.jpg | chair | chair | 67% | auto | chair, recliner, seat belt |
| chair-07.jpg | chair | chair | 55% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | (not sure) | 7% | scanner |  |
| chair-10.jpg | chair | (not sure) | 6% | scanner |  |
| clock-01.jpg | clock | clock | 92% | auto | clock, drum, watch |
| clock-03.jpg | clock | clock | 65% | auto | clock, watch, drum |
| clock-04.jpg | clock | clock | 79% | auto | clock, alarm clock, watch |
| clock-05.jpg | clock | clock | 90% | auto | clock, kitchen timer, watch |
| cup-01.jpg | cup | cup | 63% | auto | cup, can, mug |
| cup-03.jpg | cup | juice | 80% | auto | juice, glass, orange |
| dog-01.jpg | dog | dog | 66% | auto | dog, rabbit, dog leash |
| dog-02.jpg | dog | dog | 84% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 67% | auto | dog leash, dog, hot dog |
| dog-07.jpg | dog | dog | 71% | auto | dog, hot dog, dog leash |
| dog-08.jpg | dog | dog | 67% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 75% | auto | dog, dog leash, hot dog |
| dog-11.jpg | dog | dog | 53% | auto | dog, hot dog, dog leash |
| dog-12.jpg | dog | animal | 50% | scanner | animal, dog, dog leash |
| donut-01.jpg | donut | food | 76% | auto | food, donut, candy |
| donut-02.jpg | donut | donut | 60% | auto | donut, orange, bagel |
| fork-01.jpg | fork | fork | 85% | auto | fork, spoon, tweezers |
| fridge-01.jpg | fridge | fridge | 58% | auto | fridge, shelf, freezer |
| fridge-04.jpg | fridge | fridge | 74% | auto | fridge, door, freezer |
| fridge-05.jpg | fridge | (not sure) | 8% | scanner |  |
| fridge-06.jpg | fridge | fridge | 61% | auto | fridge, door, freezer |
| fridge-08.jpg | fridge | fridge | 40% | scanner | fridge, mirror, freezer |
| fridge-09.jpg | fridge | fridge | 58% | auto | fridge, door, freezer |
| fridge-10.jpg | fridge | (not sure) | 4% | scanner |  |
| fridge-12.jpg | fridge | door | 23% | scanner | door, fridge, door handle |
| keyboard-01.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, computer mouse |
| keyboard-03.jpg | keyboard | keyboard | 98% | auto | keyboard, music keyboard, computer mouse |
| knife-01.jpg | knife | knife | 95% | auto | knife, spatula, fork |
| knife-03.jpg | knife | fork | 80% | auto | fork, spoon, spatula |
| laptop-02.jpg | laptop | laptop | 86% | auto | laptop, notebook, monitor |
| laptop-03.jpg | laptop | laptop | 80% | auto | laptop, sun, notebook |
| laptop-04.jpg | laptop | (not sure) | 9% | scanner |  |
| laptop-05.jpg | laptop | laptop | 34% | scanner | laptop, desk, notebook |
| laptop-06.jpg | laptop | laptop | 51% | auto | laptop, keyboard, computer |
| laptop-07.jpg | laptop | electronics | 59% | scanner | electronics, laptop, keyboard |
| microwave-01.jpg | microwave | microwave | 52% | auto | microwave, pumpkin, oven |
| microwave-02.jpg | microwave | microwave | 37% | scanner | microwave, toaster, radio |
| orange-01.jpg | orange | fruit | 55% | scanner | fruit, orange, apple |
| orange-02.jpg | orange | orange | 54% | auto | orange, carrot, lemon |
| oven-01.jpg | oven | (not sure) | 4% | scanner |  |
| oven-02.jpg | oven | food | 77% | auto | food, bread, pot |
| oven-04.jpg | oven | food | 51% | scanner | food, pizza, stove |
| oven-05.jpg | oven | (not sure) | 7% | scanner |  |
| oven-06.jpg | oven | (not sure) | 10% | scanner |  |
| oven-07.jpg | oven | (not sure) | 6% | scanner |  |
| person-02.jpg | person | person | 54% | scanner | person, face, head |
| person-04.jpg | person | phone | 13% | scanner | phone, person, book |
| person-05.jpg | person | clothes | 84% | auto | clothes, tie, hat |
| person-06.jpg | person | tie | 73% | auto | tie, suit, person |
| person-08.jpg | person | person | 70% | auto | person, mouth, child |
| person-09.jpg | person | child | 62% | auto | child, honey, baby |
| person-10.jpg | person | hat | 52% | auto | hat, face, book |
| person-12.jpg | person | clothes | 90% | auto | clothes, suit, skirt |
| phone-01.jpg | phone | (not sure) | 6% | scanner |  |
| phone-02.jpg | phone | (not sure) | 7% | scanner |  |
| pizza-01.jpg | pizza | food | 70% | auto | food, bacon, carrot |
| pizza-02.jpg | pizza | food | 60% | auto | food, pie, pizza |
| pizza-07.jpg | pizza | pizza | 60% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | carrot | 21% | scanner | carrot, sweet potato, peach |
| pizza-09.jpg | pizza | food | 88% | auto | food, pizza, pie |
| pizza-10.jpg | pizza | pizza | 59% | auto | pizza, pie, pancakes |
| pizza-11.jpg | pizza | (not sure) | 10% | scanner |  |
| pizza-12.jpg | pizza | food | 62% | auto | food, pizza, pie |
| plant-01.jpg | plant | flowers | 29% | scanner | flowers, flower, carrot |
| plant-03.jpg | plant | plant | 58% | auto | plant, Christmas tree, flower pot |
| plant-04.jpg | plant | fence | 13% | scanner | fence, gate, mirror |
| remote-01.jpg | remote | remote | 43% | scanner | remote, dice, knife |
| sandwich-01.jpg | sandwich | carrot | 35% | scanner | carrot, broccoli, sweet potato |
| sandwich-02.jpg | sandwich | food | 72% | auto | food, bread, sausage |
| sandwich-04.jpg | sandwich | food | 91% | auto | food, hamburger, pie |
| sandwich-05.jpg | sandwich | food | 56% | scanner | food, bread, pie |
| sandwich-06.jpg | sandwich | food | 61% | auto | food, sandwich, cabbage |
| sandwich-07.jpg | sandwich | hot dog | 49% | auto | hot dog, bread, sausage |
| sandwich-08.jpg | sandwich | carrot | 21% | scanner | carrot, hot dog, sandwich |
| sandwich-12.jpg | sandwich | food | 68% | auto | food, sandwich, paint |
| scissors-01.jpg | scissors | scissors | 93% | auto | scissors, knife, pliers |
| sink-01.jpg | sink | (not sure) | 3% | scanner |  |
| sink-03.jpg | sink | (not sure) | 2% | scanner |  |
| sink-04.jpg | sink | (not sure) | 8% | scanner |  |
| sofa-01.jpg | sofa | dog | 20% | scanner | dog, cat, chair |
| sofa-03.jpg | sofa | plate | 18% | scanner | plate, fork, meal |
| sofa-04.jpg | sofa | cat | 86% | auto | cat, orange, squirrel |
| sofa-05.jpg | sofa | furniture | 62% | auto | furniture, sofa, chair |
| sofa-06.jpg | sofa | sofa | 83% | auto | sofa, cushion, pillow |
| sofa-07.jpg | sofa | sofa | 71% | auto | sofa, envelope, chair |
| sofa-08.jpg | sofa | sofa | 74% | auto | sofa, chair, cushion |
| sofa-10.jpg | sofa | sofa | 52% | auto | sofa, carrot, chair |
| sofa-11.jpg | sofa | sofa | 74% | auto | sofa, hammer, chair |
| spoon-01.jpg | spoon | spoon | 85% | auto | spoon, fork, spatula |
| spoon-02.jpg | spoon | vegetable | 54% | scanner | vegetable, spinach, spoon |
| suitcase-01.jpg | suitcase | suitcase | 48% | auto | suitcase, door, shopping bag |
| suitcase-02.jpg | suitcase | fish | 12% | scanner | fish, airplane, garden hose |
| suitcase-03.jpg | suitcase | suitcase | 18% | scanner | suitcase, DVD, purse |
| suitcase-05.jpg | suitcase | suitcase | 55% | scanner | suitcase, DVD, orange |
| teddy-bear-02.jpg | teddy bear | teddy bear | 71% | auto | teddy bear, bagel, toy |
| teddy-bear-04.jpg | teddy bear | teddy bear | 85% | auto | teddy bear, orange, toy |
| teddy-bear-05.jpg | teddy bear | teddy bear | 87% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 98% | auto | teddy bear, dog, doll |
| toaster-01.jpg | toaster | toaster | 94% | auto | toaster, lighter, kettle |
| toothbrush-01.jpg | toothbrush | toothbrush | 96% | auto | toothbrush, carrot, scrub brush |
| tv-01.jpg | tv | clothes | 66% | auto | clothes, hat, tie |
| tv-04.jpg | tv | monitor | 66% | auto | monitor, paper, computer |
| tv-05.jpg | tv | monitor | 19% | scanner | monitor, juice, computer |
| tv-06.jpg | tv | electronics | 55% | scanner | electronics, tv, photo frame |
| tv-07.jpg | tv | monitor | 15% | scanner | monitor, tablet stand, desk |
| tv-08.jpg | tv | monitor | 67% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | monitor | 20% | scanner | monitor, ticket, whiteboard |
| umbrella-01.jpg | umbrella | umbrella | 80% | auto | umbrella, balloon, ball |
| umbrella-02.jpg | umbrella | umbrella | 90% | auto | umbrella, swimsuit, chair |
| umbrella-03.jpg | umbrella | umbrella | 90% | auto | umbrella, tent, kite |
| umbrella-06.jpg | umbrella | umbrella | 53% | auto | umbrella, Christmas tree, tent |
| umbrella-07.jpg | umbrella | umbrella | 71% | auto | umbrella, tent, orange |
| umbrella-10.jpg | umbrella | umbrella | 95% | auto | umbrella, balloon, tent |
| umbrella-11.jpg | umbrella | umbrella | 48% | auto | umbrella, watermelon, peach |
| umbrella-12.jpg | umbrella | chopsticks | 22% | scanner | chopsticks, rolling pin, pencil |
| vase-01.jpg | vase | horse | 85% | auto | horse, drum, book |
| vase-02.jpg | vase | glass | 50% | auto | glass, pumpkin, cup |
| vase-04.jpg | vase | vase | 38% | scanner | vase, glass, flowers |
| vizwiz-apple-00689.jpg | apple | fruit | 81% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | pumpkin | 45% | auto | pumpkin, carrot, soup |
| vizwiz-backpack-00499.jpg | backpack | clothes | 65% | auto | clothes, coat, jacket |
| vizwiz-bed-00316.jpg | bed | furniture | 66% | auto | furniture, bed, bedpan |
| vizwiz-beer-00319.jpg | beer | drink | 58% | scanner | drink, can, soda |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 7% | scanner (blurry) |  |
| vizwiz-box-00401.jpg | box | box | 18% | scanner | box, package, tissues |
| vizwiz-box-01128.jpg | box | person | 50% | scanner | person, leg, foot |
| vizwiz-cake-01066.jpg | cake | (not sure) | 8% | scanner |  |
| vizwiz-can-00840.jpg | can | can | 17% | scanner | can, cup, soda |
| vizwiz-can-01184.jpg | can | can | 13% | scanner | can, cup, juice |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 9% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 70% | auto | chair, stool, shower chair |
| vizwiz-coffee-00561.jpg | coffee | jar | 48% | auto | jar, flashlight, glass |
| vizwiz-coffee-00937.jpg | coffee | cup | 41% | scanner | cup, coffee, mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | ball | 16% | scanner (blurry) | ball, flashlight, light bulb |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | (not sure) | 7% | scanner |  |
| vizwiz-cookie-00772.jpg | cookie | cookie | 5% | scanner | cookie, bread, carrot |
| vizwiz-corn-01008.jpg | corn | carrot | 13% | scanner | carrot, can, corn |
| vizwiz-crackers-00558.jpg | crackers | (not sure) | 9% | scanner |  |
| vizwiz-cup-00247.jpg | cup | cup | 83% | scanner (blurry) | cup, coffee, mug |
| vizwiz-cup-00857.jpg | cup | mug | 46% | auto | mug, cup, tea |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 9% | scanner |  |
| vizwiz-dog-00025.jpg | dog | dog | 21% | scanner | dog, flashlight, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 66% | auto | dog, hot dog, dog leash |
| vizwiz-door-00190.jpg | door | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-dresser-00569.jpg | dresser | drawer | 52% | auto | drawer, dresser, cabinet |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 20% | scanner | coat rack, umbrella, ladder |
| vizwiz-finger-00182.jpg | finger | person | 63% | auto | person, finger, hand |
| vizwiz-flower-00395.jpg | flower | flowers | 47% | auto | flowers, flower, flower pot |
| vizwiz-foot-00080.jpg | foot | person | 59% | scanner | person, foot, leg |
| vizwiz-foot-01040.jpg | foot | (not sure) | 9% | scanner (blurry) |  |
| vizwiz-glass-00808.jpg | glass | glass | 53% | scanner (blurry) | glass, cup, water |
| vizwiz-glass-00952.jpg | glass | person | 67% | scanner (blurry) | person, foot, hand |
| vizwiz-hair-00530.jpg | hair | person | 63% | scanner (blurry) | person, hair, head |
| vizwiz-heater-00502.jpg | heater | (not sure) | 6% | scanner |  |
| vizwiz-heater-01064.jpg | heater | radiator | 14% | scanner | radiator, colander, heater |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 11% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 69% | scanner (blurry) | jar, jam, peanut butter |
| vizwiz-juice-00422.jpg | juice | juice | 46% | auto | juice, dice, juice box |
| vizwiz-ketchup-00112.jpg | ketchup | (not sure) | 7% | scanner |  |
| vizwiz-ketchup-00220.jpg | ketchup | beer | 13% | scanner | beer, can, ketchup |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 95% | auto | keyboard, keys, music keyboard |
| vizwiz-keyboard-00187.jpg | keyboard | electronics | 60% | auto | electronics, keyboard, flashlight |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 19% | scanner | rope, fork, phone charger |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 28% | scanner | keyboard, piano, desk |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 83% | auto | keyboard, piano, keys |
| vizwiz-lighter-00806.jpg | lighter | (not sure) | 5% | scanner |  |
| vizwiz-lotion-00026.jpg | lotion | soap | 22% | scanner | soap, lighter, lotion |
| vizwiz-lotion-01072.jpg | lotion | (not sure) | 10% | scanner |  |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | magnifying glass | 15% | scanner | magnifying glass, ladle, flashlight |
| vizwiz-mailbox-00117.jpg | mailbox | (not sure) | 7% | scanner |  |
| vizwiz-medicine-00339.jpg | medicine | (not sure) | 9% | scanner |  |
| vizwiz-milk-00704.jpg | milk | can | 13% | scanner (blurry) | can, beer, cup |
| vizwiz-money-00473.jpg | money | money | 89% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | (not sure) | 11% | scanner (blurry) |  |
| vizwiz-monitor-00663.jpg | monitor | pumpkin | 15% | scanner | pumpkin, orange, pear |
| vizwiz-mug-00104.jpg | mug | mug | 67% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 20% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 49% | scanner (blurry) | paper, bill, envelope |
| vizwiz-pear-00245.jpg | pear | pear | 55% | auto | pear, avocado, lime |
| vizwiz-pen-00570.jpg | pen | pen | 14% | scanner | pen, chopsticks, pencil |
| vizwiz-phone-00274.jpg | phone | phone | 42% | scanner (blurry) | phone, flashlight, camera |
| vizwiz-phone-00562.jpg | phone | phone | 49% | auto | phone, pen, remote |
| vizwiz-phone-01124.jpg | phone | phone | 41% | scanner | phone, DVD, mirror |
| vizwiz-phone-01130.jpg | phone | phone | 60% | scanner (blurry) | phone, DVD, remote |
| vizwiz-picture-00559.jpg | picture | photo frame | 48% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | person | 63% | auto | person, finger, lime |
| vizwiz-pills-01113.jpg | pills | flashlight | 16% | scanner (blurry) | flashlight, light bulb, traffic light |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 86% | auto | pumpkin, pie, ball |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 5% | scanner |  |
| vizwiz-radio-00642.jpg | radio | radio | 18% | scanner | radio, book, ticket |
| vizwiz-remote-00012.jpg | remote | remote | 92% | auto | remote, calculator, flashlight |
| vizwiz-remote-00387.jpg | remote | remote | 92% | auto | remote, game controller, flashlight |
| vizwiz-remote-00439.jpg | remote | remote | 50% | auto | remote, dice, leg |
| vizwiz-scissors-00315.jpg | scissors | scissors | 100% | auto | scissors, fork, knife |
| vizwiz-shampoo-00096.jpg | shampoo | toothpaste | 14% | scanner | toothpaste, soap, shampoo |
| vizwiz-shampoo-00631.jpg | shampoo | (not sure) | 9% | scanner |  |
| vizwiz-shaving-cream-00244.jpg | shaving cream | (not sure) | 10% | scanner |  |
| vizwiz-shaving-cream-00733.jpg | shaving cream | (not sure) | 12% | scanner |  |
| vizwiz-shoes-00005.jpg | shoes | person | 59% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 33% | scanner | sink, toilet, bathroom sink |
| vizwiz-soap-00460.jpg | soap | blanket | 28% | scanner | blanket, shirt, towel |
| vizwiz-soda-01042.jpg | soda | beer | 26% | scanner (blurry) | beer, urinal bottle, can |
| vizwiz-soda-01207.jpg | soda | finger | 25% | scanner (blurry) | finger, flashlight, hand |
| vizwiz-soup-00995.jpg | soup | soup | 18% | scanner | soup, can, carrot |
| vizwiz-spinach-01009.jpg | spinach | (not sure) | 10% | scanner |  |
| vizwiz-spray-bottle-00364.jpg | spray bottle | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-stairs-00699.jpg | stairs | stairs | 66% | auto | stairs, ladder, stair lift |
| vizwiz-stove-00678.jpg | stove | (not sure) | 3% | scanner |  |
| vizwiz-sugar-00134.jpg | sugar | juice | 16% | scanner | juice, drum, juice box |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 7% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 23% | scanner | tissues, juice, lime |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 83% | auto | toilet paper, paper, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 5% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 26% | scanner (blurry) | flashlight, folder, light bulb |
| vizwiz-water-00659.jpg | water | flashlight | 29% | scanner (blurry) | flashlight, lighter, lamp |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 59% | auto | water bottle, urinal bottle, glass |
| vizwiz-wine-00669.jpg | wine | beer | 33% | scanner | beer, honey, urinal bottle |
| vizwiz-wine-00946.jpg | wine | (not sure) | 7% | scanner (blurry) |  |
| vizwiz-wine-01068.jpg | wine | beer | 17% | scanner | beer, glass, urinal bottle |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 58% | auto | glass, wine, cup |
| vizwiz-yogurt-01051.jpg | yogurt | (not sure) | 4% | scanner |  |
| water-bottle-01.jpg | water bottle | water bottle | 14% | scanner | water bottle, baby bottle, hand |
| wine-glass-02.jpg | wine glass | wine | 51% | auto | wine, glass, glasses |

### test-images-public/dev-ring-ble, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 44% | 57% | 51% | 11% | 10% | 17% | 107 / 179 | 137 | vocab 231, none 46 |
| coco | 172 | 51% | 63% | 67% | 15% | 11% | 12% | 108 / 182 | 138 | vocab 152, none 20 |
| cluttered | 131 | 46% | 59% | 66% | 17% | 12% | 11% | 110 / 183 | 140 | vocab 116, none 15 |
| fruit | 12 | 50% | 75% | 83% | 8% | 25% | 0% | 112 / 182 | 141 | vocab 12 |
| ring-ble | 277 | 44% | 57% | 51% | 11% | 10% | 17% | 107 / 179 | 137 | vocab 231, none 46 |
| clothes & accessories | 11 | 73% | 73% | 82% | 0% | 9% | 0% | 79 / 111 | 109 | vocab 11 |
| table | 41 | 66% | 78% | 68% | 10% | 7% | 12% | 103 / 154 | 133 | vocab 36, none 5 |
| single | 41 | 66% | 78% | 68% | 10% | 7% | 12% | 103 / 154 | 133 | vocab 36, none 5 |
| furniture & home | 48 | 40% | 52% | 54% | 15% | 8% | 17% | 105 / 182 | 134 | vocab 40, none 8 |
| office & reading | 5 | 60% | 60% | 0% | 0% | 0% | 20% | 83 / 113 | 113 | none 1, vocab 4 |
| kitchen & dining | 46 | 41% | 52% | 48% | 22% | 0% | 24% | 110 / 179 | 140 | vocab 35, none 11 |
| vegetables | 7 | 57% | 86% | 71% | 14% | 0% | 14% | 88 / 151 | 118 | vocab 6, none 1 |
| food & meals | 34 | 18% | 47% | 53% | 6% | 38% | 21% | 125 / 183 | 154 | vocab 27, none 7 |
| pets & animals | 18 | 89% | 100% | 89% | 6% | 6% | 0% | 90 / 178 | 119 | vocab 18 |
| electronics & media | 28 | 57% | 61% | 54% | 14% | 4% | 0% | 109 / 180 | 139 | vocab 28 |
| people & body | 12 | 17% | 58% | 58% | 42% | 42% | 8% | 110 / 154 | 141 | vocab 11, none 1 |
| personal items | 13 | 62% | 62% | 23% | 0% | 0% | 38% | 107 / 127 | 137 | none 5, vocab 8 |
| tools & household | 3 | 67% | 100% | 67% | 0% | 0% | 0% | 104 / 116 | 133 | vocab 3 |
| leisure & play | 5 | 80% | 80% | 80% | 0% | 0% | 20% | 99 / 118 | 129 | vocab 4, none 1 |
| bathroom & hygiene | 13 | 23% | 38% | 15% | 0% | 0% | 46% | 104 / 156 | 134 | vocab 7, none 6 |
| held | 105 | 32% | 48% | 25% | 5% | 10% | 25% | 106 / 154 | 135 | vocab 79, none 26 |
| vizwiz | 105 | 32% | 48% | 25% | 5% | 10% | 25% | 106 / 154 | 135 | vocab 79, none 26 |
| drinks | 16 | 25% | 31% | 6% | 0% | 6% | 19% | 119 / 179 | 148 | vocab 13, none 3 |
| cleaning & laundry | 2 | 0% | 0% | 0% | 0% | 0% | 50% | 105 / 127 | 135 | vocab 1, none 1 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 109 / 109 | 139 | vocab 1 |
| health & medical | 3 | 0% | 0% | 0% | 0% | 0% | 33% | 132 / 155 | 162 | none 1, vocab 2 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 47% | auto | apple, peach, pear |
| apple-03.jpg | apple | apple | 83% | auto | apple, pear, peach |
| backpack-01.jpg | backpack | backpack | 83% | auto | backpack, blanket, purse |
| banana-01.jpg | banana | eye | 16% | scanner | eye, banana, bagel |
| banana-02.jpg | banana | banana | 86% | auto | banana, corn, lemon |
| banana-04.jpg | banana | banana | 79% | auto | banana, mango, pear |
| banana-05.jpg | banana | banana | 76% | auto | banana, Christmas tree, tree |
| banana-06.jpg | banana | vegetable | 53% | scanner | vegetable, carrot, green beans |
| bed-01.jpg | bed | remote | 24% | scanner | remote, cup, book |
| bed-03.jpg | bed | (not sure) | 5% | scanner |  |
| bed-04.jpg | bed | blanket | 26% | scanner | blanket, coat, skirt |
| bed-05.jpg | bed | bed | 46% | auto | bed, mattress, bedpan |
| bed-06.jpg | bed | curtains | 54% | auto | curtains, umbrella, tent |
| bed-09.jpg | bed | furniture | 66% | auto | furniture, blanket, sheets |
| bed-10.jpg | bed | bicycle | 95% | auto | bicycle, exercise bike, fork |
| bed-11.jpg | bed | blanket | 24% | scanner | blanket, bedpan, shirt |
| bed-12.jpg | bed | bed | 13% | scanner | bed, bedpan, bench |
| book-01.jpg | book | (not sure) | 4% | scanner |  |
| book-02.jpg | book | crayons | 32% | scanner | crayons, chopsticks, pencil |
| bowl-01.jpg | bowl | vegetable | 72% | auto | vegetable, broccoli, soup |
| bowl-02.jpg | bowl | pasta | 63% | auto | pasta, noodles, broccoli |
| bowl-04.jpg | bowl | soup | 65% | auto | soup, carrot, chopsticks |
| bowl-05.jpg | bowl | food | 63% | auto | food, pie, fork |
| bowl-07.jpg | bowl | lemon | 34% | scanner | lemon, carrot, orange |
| bowl-09.jpg | bowl | (not sure) | 5% | scanner |  |
| bowl-10.jpg | bowl | carrot | 19% | scanner | carrot, peas, garden |
| bowl-12.jpg | bowl | (not sure) | 9% | scanner |  |
| broccoli-01.jpg | broccoli | broccoli | 82% | auto | broccoli, cauliflower, peas |
| broccoli-03.jpg | broccoli | strawberry | 50% | auto | strawberry, broccoli, pear |
| cake-01.jpg | cake | food | 90% | scanner (blurry) | food, cake, cupcake |
| cake-02.jpg | cake | cake | 83% | auto | cake, cupcake, rosary |
| cake-03.jpg | cake | cake | 89% | auto | cake, cupcake, rosary |
| cake-05.jpg | cake | (not sure) | 12% | scanner |  |
| cake-07.jpg | cake | food | 83% | auto | food, bagel, bread |
| carrot-01.jpg | carrot | carrot | 94% | auto | carrot, corn, sweet potato |
| carrot-02.jpg | carrot | carrot | 88% | auto | carrot, sweet potato, peas |
| carrot-03.jpg | carrot | carrot | 99% | auto | carrot, sweet potato, corn |
| cat-01.jpg | cat | cat | 98% | auto | cat, book, orange |
| cat-02.jpg | cat | cat | 75% | auto | cat, hamster, squirrel |
| cat-03.jpg | cat | cat | 82% | auto | cat, eye, hat |
| cat-05.jpg | cat | animal | 62% | auto | animal, rabbit, cat |
| cat-07.jpg | cat | cat | 84% | auto | cat, rabbit, flashlight |
| cat-10.jpg | cat | cat | 99% | auto | cat, squirrel, book |
| cat-11.jpg | cat | cat | 97% | auto | cat, squirrel, rabbit |
| cat-12.jpg | cat | cat | 50% | auto | cat, squirrel, rabbit |
| chair-01.jpg | chair | (not sure) | 5% | scanner |  |
| chair-02.jpg | chair | mirror | 76% | auto | mirror, chair, door |
| chair-04.jpg | chair | chair | 49% | auto | chair, high chair, recliner |
| chair-05.jpg | chair | chair | 67% | auto | chair, recliner, seat belt |
| chair-07.jpg | chair | chair | 52% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | (not sure) | 7% | scanner |  |
| chair-10.jpg | chair | (not sure) | 7% | scanner |  |
| clock-01.jpg | clock | clock | 81% | auto | clock, honey, watch |
| clock-03.jpg | clock | clock | 68% | auto | clock, drum, watch |
| clock-04.jpg | clock | clock | 81% | auto | clock, alarm clock, watch |
| clock-05.jpg | clock | clock | 57% | auto | clock, watch, thermometer |
| cup-01.jpg | cup | cup | 61% | auto | cup, can, mug |
| cup-03.jpg | cup | juice | 47% | auto | juice, glass, honey |
| dog-01.jpg | dog | dog | 68% | auto | dog, rabbit, dog leash |
| dog-02.jpg | dog | dog | 84% | auto | dog, hair, hot dog |
| dog-04.jpg | dog | dog leash | 67% | auto | dog leash, dog, keys |
| dog-07.jpg | dog | dog | 71% | auto | dog, dog leash, hot dog |
| dog-08.jpg | dog | dog | 69% | auto | dog, hot dog, carrot |
| dog-09.jpg | dog | dog | 79% | auto | dog, hot dog, dog leash |
| dog-11.jpg | dog | dog | 67% | auto | dog, hot dog, dog leash |
| dog-12.jpg | dog | dog | 36% | scanner | dog, hot dog, dog leash |
| donut-01.jpg | donut | food | 76% | auto | food, donut, candy |
| donut-02.jpg | donut | donut | 60% | auto | donut, orange, bagel |
| fork-01.jpg | fork | fork | 76% | auto | fork, spoon, carrot |
| fridge-01.jpg | fridge | fridge | 58% | auto | fridge, shelf, freezer |
| fridge-04.jpg | fridge | fridge | 74% | auto | fridge, door, freezer |
| fridge-05.jpg | fridge | door | 12% | scanner | door, fridge, garage door |
| fridge-06.jpg | fridge | fridge | 75% | auto | fridge, door, freezer |
| fridge-08.jpg | fridge | fridge | 40% | scanner | fridge, mirror, freezer |
| fridge-09.jpg | fridge | fridge | 56% | auto | fridge, door, freezer |
| fridge-10.jpg | fridge | (not sure) | 5% | scanner |  |
| fridge-12.jpg | fridge | door | 15% | scanner | door, fridge, door handle |
| keyboard-01.jpg | keyboard | keyboard | 50% | auto | keyboard, waffle, soap |
| keyboard-03.jpg | keyboard | keyboard | 99% | auto | keyboard, music keyboard, computer mouse |
| knife-01.jpg | knife | knife | 95% | auto | knife, spatula, fork |
| knife-03.jpg | knife | fork | 78% | auto | fork, chopsticks, spoon |
| laptop-02.jpg | laptop | laptop | 86% | auto | laptop, notebook, monitor |
| laptop-03.jpg | laptop | laptop | 80% | auto | laptop, envelope, notebook |
| laptop-04.jpg | laptop | foot | 14% | scanner | foot, leg, finger |
| laptop-05.jpg | laptop | laptop | 34% | scanner | laptop, desk, notebook |
| laptop-06.jpg | laptop | laptop | 80% | auto | laptop, notebook, webcam |
| laptop-07.jpg | laptop | laptop | 68% | auto | laptop, keyboard, notebook |
| microwave-01.jpg | microwave | microwave | 52% | auto | microwave, pumpkin, oven |
| microwave-02.jpg | microwave | microwave | 37% | scanner | microwave, toaster, radio |
| orange-01.jpg | orange | fruit | 61% | auto | fruit, orange, apple |
| orange-02.jpg | orange | orange | 46% | auto | orange, carrot, lemon |
| oven-01.jpg | oven | (not sure) | 4% | scanner |  |
| oven-02.jpg | oven | food | 66% | auto | food, bread, pot |
| oven-04.jpg | oven | food | 51% | scanner | food, pizza, stove |
| oven-05.jpg | oven | (not sure) | 3% | scanner |  |
| oven-06.jpg | oven | (not sure) | 10% | scanner |  |
| oven-07.jpg | oven | (not sure) | 9% | scanner |  |
| person-02.jpg | person | person | 54% | scanner | person, face, head |
| person-04.jpg | person | phone | 13% | scanner | phone, person, book |
| person-05.jpg | person | clothes | 84% | auto | clothes, tie, hat |
| person-06.jpg | person | tie | 64% | auto | tie, person, suit |
| person-08.jpg | person | person | 73% | auto | person, child, spoon |
| person-09.jpg | person | child | 62% | auto | child, honey, baby |
| person-10.jpg | person | hat | 52% | auto | hat, face, book |
| person-12.jpg | person | clothes | 90% | auto | clothes, suit, skirt |
| phone-01.jpg | phone | (not sure) | 6% | scanner |  |
| phone-02.jpg | phone | (not sure) | 11% | scanner |  |
| pizza-01.jpg | pizza | food | 70% | auto | food, bacon, carrot |
| pizza-02.jpg | pizza | food | 60% | auto | food, pie, pizza |
| pizza-07.jpg | pizza | pizza | 60% | auto | pizza, pasta, pie |
| pizza-08.jpg | pizza | food | 66% | auto | food, bacon, carrot |
| pizza-09.jpg | pizza | food | 79% | auto | food, pie, pizza |
| pizza-10.jpg | pizza | pizza | 57% | auto | pizza, pie, pasta |
| pizza-11.jpg | pizza | (not sure) | 10% | scanner |  |
| pizza-12.jpg | pizza | food | 62% | auto | food, pizza, pie |
| plant-01.jpg | plant | flowers | 54% | scanner | flowers, flower, carrot |
| plant-03.jpg | plant | plant | 58% | auto | plant, Christmas tree, flower pot |
| plant-04.jpg | plant | fence | 12% | scanner | fence, chopsticks, pen |
| remote-01.jpg | remote | remote | 43% | scanner | remote, knife, eraser |
| sandwich-01.jpg | sandwich | carrot | 26% | scanner | carrot, broccoli, fish |
| sandwich-02.jpg | sandwich | (not sure) | 7% | scanner |  |
| sandwich-04.jpg | sandwich | food | 91% | auto | food, hamburger, bagel |
| sandwich-05.jpg | sandwich | food | 56% | scanner | food, bread, pie |
| sandwich-06.jpg | sandwich | food | 69% | auto | food, sandwich, cabbage |
| sandwich-07.jpg | sandwich | hot dog | 49% | auto | hot dog, bread, sausage |
| sandwich-08.jpg | sandwich | carrot | 23% | scanner | carrot, hot dog, taco |
| sandwich-12.jpg | sandwich | food | 72% | auto | food, bread, sandwich |
| scissors-01.jpg | scissors | scissors | 92% | auto | scissors, knife, tweezers |
| sink-01.jpg | sink | sink | 39% | scanner | sink, bathroom sink, toilet |
| sink-03.jpg | sink | (not sure) | 2% | scanner |  |
| sink-04.jpg | sink | (not sure) | 2% | scanner |  |
| sofa-01.jpg | sofa | dog | 20% | scanner | dog, cat, chair |
| sofa-03.jpg | sofa | plate | 15% | scanner | plate, fork, pancakes |
| sofa-04.jpg | sofa | cat | 82% | auto | cat, orange, hamster |
| sofa-05.jpg | sofa | furniture | 62% | auto | furniture, sofa, chair |
| sofa-06.jpg | sofa | sofa | 83% | auto | sofa, cushion, pillow |
| sofa-07.jpg | sofa | sofa | 71% | auto | sofa, hammer, chair |
| sofa-08.jpg | sofa | sofa | 73% | auto | sofa, chair, cushion |
| sofa-10.jpg | sofa | sofa | 52% | auto | sofa, carrot, chair |
| sofa-11.jpg | sofa | sofa | 74% | auto | sofa, finger, chair |
| spoon-01.jpg | spoon | spoon | 85% | auto | spoon, chopsticks, spatula |
| spoon-02.jpg | spoon | vegetable | 73% | auto | vegetable, spinach, spoon |
| suitcase-01.jpg | suitcase | suitcase | 48% | auto | suitcase, door, shopping bag |
| suitcase-02.jpg | suitcase | (not sure) | 11% | scanner |  |
| suitcase-03.jpg | suitcase | suitcase | 18% | scanner | suitcase, DVD, purse |
| suitcase-05.jpg | suitcase | suitcase | 34% | scanner | suitcase, DVD, orange |
| teddy-bear-02.jpg | teddy bear | teddy bear | 82% | auto | teddy bear, eye, toy |
| teddy-bear-04.jpg | teddy bear | teddy bear | 85% | auto | teddy bear, orange, toy |
| teddy-bear-05.jpg | teddy bear | teddy bear | 46% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 98% | auto | teddy bear, dog, doll |
| toaster-01.jpg | toaster | toaster | 94% | auto | toaster, lighter, blender |
| toothbrush-01.jpg | toothbrush | toothbrush | 96% | auto | toothbrush, carrot, scrub brush |
| tv-01.jpg | tv | clothes | 66% | auto | clothes, hat, tie |
| tv-04.jpg | tv | monitor | 66% | auto | monitor, spatula, computer |
| tv-05.jpg | tv | electronics | 63% | auto | electronics, monitor, paper |
| tv-06.jpg | tv | tv | 16% | scanner | tv, photo frame, fence |
| tv-07.jpg | tv | monitor | 15% | scanner | monitor, tablet stand, desk |
| tv-08.jpg | tv | monitor | 67% | auto | monitor, airplane, tv |
| tv-10.jpg | tv | monitor | 20% | scanner | monitor, ticket, whiteboard |
| umbrella-01.jpg | umbrella | umbrella | 80% | auto | umbrella, balloon, kite |
| umbrella-02.jpg | umbrella | umbrella | 46% | auto | umbrella, kite, tent |
| umbrella-03.jpg | umbrella | umbrella | 73% | auto | umbrella, tent, kite |
| umbrella-06.jpg | umbrella | umbrella | 53% | auto | umbrella, Christmas tree, tent |
| umbrella-07.jpg | umbrella | umbrella | 71% | auto | umbrella, tent, orange |
| umbrella-10.jpg | umbrella | umbrella | 99% | auto | umbrella, balloon, tent |
| umbrella-11.jpg | umbrella | umbrella | 97% | auto | umbrella, rain, coat |
| umbrella-12.jpg | umbrella | chopsticks | 13% | scanner | chopsticks, rolling pin, pen |
| vase-01.jpg | vase | horse | 87% | auto | horse, drum, book |
| vase-02.jpg | vase | glass | 50% | auto | glass, pumpkin, cup |
| vase-04.jpg | vase | vase | 38% | scanner | vase, glass, flowers |
| vizwiz-apple-00689.jpg | apple | fruit | 81% | auto | fruit, pear, lemon |
| vizwiz-baby-food-00943.jpg | baby food | pumpkin | 45% | auto | pumpkin, carrot, soup |
| vizwiz-backpack-00499.jpg | backpack | clothes | 65% | auto | clothes, coat, jacket |
| vizwiz-bed-00316.jpg | bed | furniture | 66% | auto | furniture, bed, bedpan |
| vizwiz-beer-00319.jpg | beer | drink | 58% | scanner | drink, can, soda |
| vizwiz-blanket-00757.jpg | blanket | (not sure) | 7% | scanner (blurry) |  |
| vizwiz-box-00401.jpg | box | box | 18% | scanner | box, package, tissues |
| vizwiz-box-01128.jpg | box | person | 50% | scanner | person, leg, foot |
| vizwiz-cake-01066.jpg | cake | (not sure) | 8% | scanner |  |
| vizwiz-can-00840.jpg | can | can | 17% | scanner | can, cup, soda |
| vizwiz-can-01184.jpg | can | glass | 3% | scanner | glass, carrot, book |
| vizwiz-carpet-00984.jpg | carpet | (not sure) | 9% | scanner (blurry) |  |
| vizwiz-chair-00859.jpg | chair | chair | 70% | auto | chair, stool, shower chair |
| vizwiz-coffee-00561.jpg | coffee | (not sure) | 11% | scanner |  |
| vizwiz-coffee-00937.jpg | coffee | cup | 41% | scanner | cup, coffee, mug |
| vizwiz-coffee-maker-00085.jpg | coffee maker | (not sure) | 6% | scanner (blurry) |  |
| vizwiz-computer-mouse-00672.jpg | computer mouse | ball | 16% | scanner (blurry) | ball, flashlight, light bulb |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 4% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | (not sure) | 7% | scanner |  |
| vizwiz-cookie-00772.jpg | cookie | food | 61% | auto | food, cookie, bread |
| vizwiz-corn-01008.jpg | corn | carrot | 13% | scanner | carrot, can, corn |
| vizwiz-crackers-00558.jpg | crackers | hand | 21% | scanner | hand, finger, arm |
| vizwiz-cup-00247.jpg | cup | cup | 83% | scanner (blurry) | cup, coffee, mug |
| vizwiz-cup-00857.jpg | cup | cup | 47% | auto | cup, mug, tea |
| vizwiz-deodorant-00556.jpg | deodorant | (not sure) | 9% | scanner |  |
| vizwiz-dog-00025.jpg | dog | dog | 21% | scanner | dog, flashlight, hot dog |
| vizwiz-dog-00318.jpg | dog | dog | 66% | auto | dog, hot dog, dog leash |
| vizwiz-door-00190.jpg | door | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-dresser-00569.jpg | dresser | drawer | 64% | auto | drawer, dresser, cabinet |
| vizwiz-drying-rack-00329.jpg | drying rack | coat rack | 20% | scanner | coat rack, umbrella, ladder |
| vizwiz-finger-00182.jpg | finger | person | 80% | auto | person, finger, arm |
| vizwiz-flower-00395.jpg | flower | flowers | 47% | auto | flowers, flower, flower pot |
| vizwiz-foot-00080.jpg | foot | person | 59% | scanner | person, foot, leg |
| vizwiz-foot-01040.jpg | foot | (not sure) | 9% | scanner (blurry) |  |
| vizwiz-glass-00808.jpg | glass | glass | 42% | scanner (blurry) | glass, jar, water |
| vizwiz-glass-00952.jpg | glass | person | 67% | scanner (blurry) | person, foot, hand |
| vizwiz-hair-00530.jpg | hair | person | 63% | scanner (blurry) | person, hair, head |
| vizwiz-heater-00502.jpg | heater | furniture | 59% | scanner | furniture, cabinet, dresser |
| vizwiz-heater-01064.jpg | heater | radiator | 14% | scanner | radiator, colander, heater |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | (not sure) | 11% | scanner |  |
| vizwiz-jar-01056.jpg | jar | jar | 69% | scanner (blurry) | jar, jam, peanut butter |
| vizwiz-juice-00422.jpg | juice | juice | 46% | auto | juice, dice, juice box |
| vizwiz-ketchup-00112.jpg | ketchup | (not sure) | 6% | scanner |  |
| vizwiz-ketchup-00220.jpg | ketchup | beer | 22% | scanner | beer, soap, ketchup |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 95% | auto | keyboard, keys, music keyboard |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 27% | scanner | keyboard, flashlight, dice |
| vizwiz-keyboard-00221.jpg | keyboard | rope | 19% | scanner | rope, fork, phone charger |
| vizwiz-keyboard-00828.jpg | keyboard | keyboard | 28% | scanner | keyboard, piano, desk |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 83% | auto | keyboard, piano, keys |
| vizwiz-lighter-00806.jpg | lighter | flashlight | 18% | scanner | flashlight, lighter, lamp |
| vizwiz-lotion-00026.jpg | lotion | soap | 22% | scanner | soap, lighter, lotion |
| vizwiz-lotion-01072.jpg | lotion | carrot | 13% | scanner | carrot, orange, cup |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | magnifying glass | 15% | scanner | magnifying glass, ladle, flashlight |
| vizwiz-mailbox-00117.jpg | mailbox | (not sure) | 7% | scanner |  |
| vizwiz-medicine-00339.jpg | medicine | (not sure) | 9% | scanner |  |
| vizwiz-milk-00704.jpg | milk | can | 13% | scanner (blurry) | can, beer, cup |
| vizwiz-money-00473.jpg | money | money | 89% | auto | money, bill, ticket |
| vizwiz-money-00791.jpg | money | (not sure) | 11% | scanner (blurry) |  |
| vizwiz-monitor-00663.jpg | monitor | pumpkin | 15% | scanner | pumpkin, orange, pear |
| vizwiz-mug-00104.jpg | mug | mug | 67% | auto | mug, cup, coffee |
| vizwiz-mustard-01033.jpg | mustard | lemon | 20% | scanner | lemon, mustard, soap |
| vizwiz-paper-00483.jpg | paper | paper | 49% | scanner (blurry) | paper, bill, envelope |
| vizwiz-pear-00245.jpg | pear | fruit | 83% | auto | fruit, pear, lime |
| vizwiz-pen-00570.jpg | pen | pen | 14% | scanner | pen, chopsticks, pencil |
| vizwiz-phone-00274.jpg | phone | phone | 59% | scanner (blurry) | phone, flashlight, camera |
| vizwiz-phone-00562.jpg | phone | phone | 73% | auto | phone, DVD, remote |
| vizwiz-phone-01124.jpg | phone | phone | 41% | scanner | phone, DVD, mirror |
| vizwiz-phone-01130.jpg | phone | phone | 60% | scanner (blurry) | phone, DVD, remote |
| vizwiz-picture-00559.jpg | picture | photo frame | 32% | scanner | photo frame, picture, photo |
| vizwiz-pill-bottle-00089.jpg | pill bottle | lime | 19% | scanner | lime, salt, lighter |
| vizwiz-pills-01113.jpg | pills | flashlight | 16% | scanner (blurry) | flashlight, light bulb, traffic light |
| vizwiz-pineapple-00804.jpg | pineapple | pumpkin | 86% | auto | pumpkin, pie, ball |
| vizwiz-popcorn-00412.jpg | popcorn | (not sure) | 5% | scanner |  |
| vizwiz-radio-00642.jpg | radio | radio | 18% | scanner | radio, book, ticket |
| vizwiz-remote-00012.jpg | remote | remote | 92% | auto | remote, calculator, flashlight |
| vizwiz-remote-00387.jpg | remote | remote | 92% | auto | remote, game controller, flashlight |
| vizwiz-remote-00439.jpg | remote | remote | 73% | auto | remote, flashlight, foot |
| vizwiz-scissors-00315.jpg | scissors | scissors | 100% | auto | scissors, fork, knife |
| vizwiz-shampoo-00096.jpg | shampoo | toothpaste | 14% | scanner | toothpaste, soap, shampoo |
| vizwiz-shampoo-00631.jpg | shampoo | (not sure) | 9% | scanner |  |
| vizwiz-shaving-cream-00244.jpg | shaving cream | (not sure) | 10% | scanner |  |
| vizwiz-shaving-cream-00733.jpg | shaving cream | (not sure) | 12% | scanner |  |
| vizwiz-shoes-00005.jpg | shoes | person | 59% | scanner (blurry) | person, foot, leg |
| vizwiz-sink-00897.jpg | sink | sink | 33% | scanner | sink, toilet, bathroom sink |
| vizwiz-soap-00460.jpg | soap | blanket | 28% | scanner | blanket, shirt, towel |
| vizwiz-soda-01042.jpg | soda | beer | 26% | scanner (blurry) | beer, urinal bottle, can |
| vizwiz-soda-01207.jpg | soda | finger | 25% | scanner (blurry) | finger, flashlight, hand |
| vizwiz-soup-00995.jpg | soup | soup | 18% | scanner | soup, can, carrot |
| vizwiz-spinach-01009.jpg | spinach | (not sure) | 10% | scanner |  |
| vizwiz-spray-bottle-00364.jpg | spray bottle | (not sure) | 5% | scanner (blurry) |  |
| vizwiz-stairs-00699.jpg | stairs | stairs | 66% | auto | stairs, ladder, stair lift |
| vizwiz-stove-00678.jpg | stove | (not sure) | 3% | scanner |  |
| vizwiz-sugar-00134.jpg | sugar | juice | 16% | scanner | juice, drum, juice box |
| vizwiz-tablet-00105.jpg | tablet | (not sure) | 7% | scanner |  |
| vizwiz-tissues-00108.jpg | tissues | tissues | 23% | scanner | tissues, juice, lime |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 83% | auto | toilet paper, paper, paper towel |
| vizwiz-toy-00367.jpg | toy | (not sure) | 5% | scanner |  |
| vizwiz-tv-00130.jpg | tv | flashlight | 26% | scanner (blurry) | flashlight, folder, light bulb |
| vizwiz-water-00659.jpg | water | flashlight | 29% | scanner (blurry) | flashlight, lighter, lamp |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 18% | scanner | water bottle, urinal bottle, baby bottle |
| vizwiz-wine-00669.jpg | wine | beer | 33% | scanner | beer, honey, urinal bottle |
| vizwiz-wine-00946.jpg | wine | (not sure) | 7% | scanner (blurry) |  |
| vizwiz-wine-01068.jpg | wine | beer | 17% | scanner | beer, glass, urinal bottle |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 58% | auto | glass, wine, cup |
| vizwiz-yogurt-01051.jpg | yogurt | (not sure) | 4% | scanner |  |
| water-bottle-01.jpg | water bottle | water bottle | 14% | scanner | water bottle, hand, baby bottle |
| wine-glass-02.jpg | wine glass | wine | 51% | auto | wine, glass, glasses |
