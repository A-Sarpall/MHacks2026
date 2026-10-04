# Cue recognition eval

## wasm (2026-10-04, 425 s)

### test-images-public/dev, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 52% | 72% | 70% | 22% | 11% | 1% | 723 / 1426 | 776 | vocab 275, none 2 |
| coco | 172 | 51% | 72% | 81% | 29% | 9% | 1% | 705 / 1500 | 754 | vocab 171, none 1 |
| cluttered | 131 | 46% | 69% | 83% | 32% | 11% | 1% | 721 / 1618 | 771 | vocab 130, none 1 |
| fruit | 12 | 58% | 83% | 67% | 0% | 42% | 0% | 544 / 1124 | 619 | vocab 12 |
| held | 105 | 54% | 73% | 52% | 11% | 13% | 1% | 751 / 1391 | 810 | vocab 104, none 1 |
| vizwiz | 105 | 54% | 73% | 52% | 11% | 13% | 1% | 751 / 1391 | 810 | vocab 104, none 1 |
| food & meals | 34 | 50% | 74% | 82% | 26% | 24% | 0% | 682 / 1618 | 731 | vocab 34 |
| clothes & accessories | 11 | 82% | 82% | 82% | 0% | 9% | 0% | 615 / 1200 | 661 | vocab 11 |
| table | 41 | 66% | 80% | 73% | 20% | 5% | 0% | 652 / 1020 | 700 | vocab 41 |
| single | 41 | 66% | 80% | 73% | 20% | 5% | 0% | 652 / 1020 | 700 | vocab 41 |
| furniture & home | 48 | 42% | 65% | 75% | 33% | 13% | 0% | 745 / 1660 | 805 | vocab 48 |
| drinks | 16 | 25% | 56% | 25% | 13% | 13% | 0% | 973 / 1397 | 1042 | vocab 16 |
| office & reading | 5 | 20% | 80% | 20% | 20% | 0% | 0% | 827 / 1120 | 888 | vocab 5 |
| kitchen & dining | 46 | 52% | 67% | 74% | 28% | 0% | 2% | 698 / 1465 | 747 | vocab 45, none 1 |
| vegetables | 7 | 100% | 100% | 100% | 0% | 0% | 0% | 332 / 385 | 386 | vocab 7 |
| pets & animals | 18 | 39% | 89% | 72% | 33% | 11% | 0% | 749 / 1126 | 797 | vocab 18 |
| electronics & media | 28 | 57% | 71% | 86% | 25% | 7% | 0% | 637 / 1365 | 684 | vocab 28 |
| bathroom & hygiene | 13 | 77% | 77% | 62% | 8% | 0% | 8% | 800 / 1168 | 849 | none 1, vocab 12 |
| cleaning & laundry | 2 | 50% | 50% | 50% | 0% | 0% | 0% | 446 / 602 | 498 | vocab 2 |
| people & body | 12 | 17% | 42% | 58% | 50% | 25% | 0% | 1075 / 1767 | 1125 | vocab 12 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 838 / 838 | 876 | vocab 1 |
| tools & household | 3 | 0% | 33% | 33% | 33% | 33% | 0% | 384 / 575 | 427 | vocab 3 |
| health & medical | 3 | 67% | 67% | 33% | 0% | 0% | 0% | 906 / 941 | 954 | vocab 3 |
| personal items | 13 | 85% | 100% | 54% | 0% | 0% | 0% | 843 / 1088 | 892 | vocab 13 |
| leisure & play | 5 | 100% | 100% | 80% | 0% | 0% | 0% | 523 / 838 | 561 | vocab 5 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 96% | auto | apple, fruit bowl, peach |
| apple-03.jpg | apple | fruit | 95% | scanner (blurry) | fruit, apple, plum |
| vizwiz-apple-00689.jpg | apple | apple | 46% | auto | apple, pear, peach |
| vizwiz-baby-food-00943.jpg | baby food | baby food | 69% | auto | baby food, juice, jam |
| backpack-01.jpg | backpack | backpack | 89% | auto | backpack, laptop, computer |
| vizwiz-backpack-00499.jpg | backpack | backpack | 55% | auto | backpack, blanket, shoulder |
| banana-04.jpg | banana | banana | 61% | auto | banana, apple, fruit bowl |
| banana-01.jpg | banana | fruit | 92% | scanner (blurry) | fruit, banana, pineapple |
| banana-06.jpg | banana | fruit | 77% | scanner (blurry) | fruit, banana, pineapple |
| banana-05.jpg | banana | banana | 99% | auto | banana, mango, lime |
| banana-02.jpg | banana | banana | 98% | auto | banana, peeler, zucchini |
| bed-12.jpg | bed | bed | 54% | auto | bed, blanket, bedpan |
| bed-04.jpg | bed | blanket | 61% | auto | blanket, coat, bed |
| bed-03.jpg | bed | first aid kit | 74% | auto | first aid kit, book, sewing kit |
| bed-10.jpg | bed | bicycle | 53% | auto | bicycle, arm sling, exercise bike |
| bed-11.jpg | bed | furniture | 59% | scanner | furniture, blanket, cat |
| bed-06.jpg | bed | curtains | 74% | auto | curtains, bed, bedpan |
| bed-01.jpg | bed | mattress | 82% | auto | mattress, incontinence pad, bed |
| bed-05.jpg | bed | sheets | 54% | auto | sheets, duvet, bed |
| vizwiz-bed-00316.jpg | bed | pillow | 58% | auto | pillow, sheets, blanket |
| bed-09.jpg | bed | blanket | 61% | auto | blanket, cushion, duvet |
| vizwiz-beer-00319.jpg | beer | drink | 80% | auto | drink, can, urinal bottle |
| vizwiz-blanket-00757.jpg | blanket | blanket | 24% | scanner | blanket, cleaning cloth, washcloth |
| book-01.jpg | book | duck | 23% | scanner | duck, book, clipboard |
| book-02.jpg | book | crayons | 57% | auto | crayons, eraser, book |
| bowl-12.jpg | bowl | leftovers | 85% | auto | leftovers, salad, lunch box |
| bowl-04.jpg | bowl | noodles | 69% | auto | noodles, soup, ladle |
| bowl-02.jpg | bowl | noodles | 56% | auto | noodles, broccoli, pasta |
| bowl-09.jpg | bowl | food | 54% | scanner | food, meal, soup |
| bowl-01.jpg | bowl | broccoli | 89% | auto | broccoli, soup, cauliflower |
| bowl-07.jpg | bowl | banana | 16% | scanner | banana, fruit bowl, bowl |
| bowl-05.jpg | bowl | food | 73% | auto | food, meal, meat |
| bowl-10.jpg | bowl | salad | 58% | auto | salad, garden, meal |
| vizwiz-box-01128.jpg | box | box | 26% | scanner (blurry) | box, leg, package |
| vizwiz-box-00401.jpg | box | package | 53% | scanner | package, box, tissues |
| broccoli-03.jpg | broccoli | broccoli | 91% | auto | broccoli, cauliflower, spinach |
| broccoli-01.jpg | broccoli | broccoli | 93% | auto | broccoli, cauliflower, salad |
| cake-07.jpg | cake | pie | 83% | auto | pie, meal, croissant |
| cake-03.jpg | cake | cake | 94% | auto | cake, peas, cupcake |
| vizwiz-cake-01066.jpg | cake | food | 56% | scanner | food, donut, credit card |
| cake-05.jpg | cake | bath mat | 62% | auto | bath mat, rug, carpet |
| cake-02.jpg | cake | cake | 90% | auto | cake, cupcake, flowers |
| cake-01.jpg | cake | cake | 98% | scanner (blurry) | cake, birthday cake, cupcake |
| vizwiz-can-00840.jpg | can | soda | 22% | scanner | soda, can, measuring cup |
| vizwiz-can-01184.jpg | can | soda | 27% | scanner | soda, apple, can |
| vizwiz-carpet-00984.jpg | carpet | leg | 13% | scanner (blurry) | leg, arm, shoulder |
| carrot-01.jpg | carrot | carrot | 94% | auto | carrot, peeler, garden |
| carrot-03.jpg | carrot | carrot | 98% | auto | carrot, sweet potato, peeler |
| carrot-02.jpg | carrot | carrot | 73% | auto | carrot, sweet potato, orange |
| cat-10.jpg | cat | cat | 93% | auto | cat, mittens, pet bed |
| cat-11.jpg | cat | cat | 90% | auto | cat, hair, mittens |
| cat-01.jpg | cat | cat | 35% | scanner | cat, heating pad, mittens |
| cat-02.jpg | cat | cat | 82% | auto | cat, pet bed, orange |
| cat-05.jpg | cat | animal | 87% | auto | animal, cat, duster |
| cat-12.jpg | cat | shoes | 48% | auto | shoes, cat, sneakers |
| cat-03.jpg | cat | clothes | 67% | scanner (blurry) | clothes, hat, eye |
| cat-07.jpg | cat | water | 52% | auto | water, straw, cat |
| chair-10.jpg | chair | guitar | 20% | scanner | guitar, seat belt, harmonica |
| chair-07.jpg | chair | chair | 70% | auto | chair, armchair, rug |
| chair-08.jpg | chair | furniture | 58% | scanner | furniture, desk, notebook |
| chair-01.jpg | chair | furniture | 82% | auto | furniture, cushion, ball |
| chair-02.jpg | chair | mirror | 72% | auto | mirror, chair, pillow |
| chair-04.jpg | chair | furniture | 66% | auto | furniture, chair, heating pad |
| vizwiz-chair-00859.jpg | chair | furniture | 55% | scanner | furniture, chair, monitor |
| chair-05.jpg | chair | chair | 57% | auto | chair, recliner, commode |
| clock-01.jpg | clock | clock | 95% | auto | clock, door handle, watch |
| clock-04.jpg | clock | clock | 89% | auto | clock, watch, kitchen timer |
| clock-03.jpg | clock | clock | 64% | auto | clock, watch, fork |
| clock-05.jpg | clock | thermometer | 79% | auto | thermometer, clock, kitchen timer |
| vizwiz-coffee-00937.jpg | coffee | mug | 46% | auto | mug, travel mug, cup |
| vizwiz-coffee-00561.jpg | coffee | jar | 28% | scanner | jar, mustard, coffee |
| vizwiz-coffee-maker-00085.jpg | coffee maker | coffee maker | 89% | auto | coffee maker, stomach, blender |
| vizwiz-computer-mouse-00672.jpg | computer mouse | computer mouse | 98% | auto | computer mouse, webcam, flashlight |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 7% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | hand cream | 60% | auto | hand cream, carpet, sunscreen |
| vizwiz-cookie-00772.jpg | cookie | food | 77% | scanner (blurry) | food, cookie, crackers |
| vizwiz-corn-01008.jpg | corn | corn | 78% | auto | corn, popcorn, candy |
| vizwiz-crackers-00558.jpg | crackers | food | 53% | scanner | food, chips, juice |
| cup-03.jpg | cup | drink | 69% | scanner (blurry) | drink, juice, orange |
| vizwiz-cup-00857.jpg | cup | mug | 49% | auto | mug, cup, measuring cup |
| cup-01.jpg | cup | soda | 61% | auto | soda, can, cup |
| vizwiz-cup-00247.jpg | cup | cup | 61% | scanner (blurry) | cup, coffee, measuring cup |
| vizwiz-deodorant-00556.jpg | deodorant | deodorant | 65% | auto | deodorant, board game, matches |
| dog-11.jpg | dog | animal | 54% | scanner | animal, dog, dog leash |
| dog-04.jpg | dog | dog leash | 72% | auto | dog leash, dog, hot dog |
| vizwiz-dog-00025.jpg | dog | dog leash | 32% | scanner | dog leash, dog, hot dog |
| dog-09.jpg | dog | beer | 55% | auto | beer, dog, shampoo |
| dog-08.jpg | dog | dog | 58% | auto | dog, hot dog, carrot |
| dog-12.jpg | dog | dog leash | 50% | auto | dog leash, scarf, belt |
| dog-07.jpg | dog | dog | 55% | auto | dog, hot dog, grass |
| dog-02.jpg | dog | dog | 74% | auto | dog, hair, hot dog |
| vizwiz-dog-00318.jpg | dog | dog leash | 47% | auto | dog leash, dog, hot dog |
| dog-01.jpg | dog | vest | 25% | scanner | vest, dog, hot dog |
| donut-02.jpg | donut | donut | 71% | auto | donut, bagel, squirrel |
| donut-01.jpg | donut | donut | 96% | auto | donut, cake, bagel |
| vizwiz-door-00190.jpg | door | shower | 14% | scanner (blurry) | shower, door handle, airplane |
| vizwiz-dresser-00569.jpg | dresser | furniture | 87% | auto | furniture, drawer, door handle |
| vizwiz-drying-rack-00329.jpg | drying rack | drying rack | 60% | auto | drying rack, shoe rack, hanger |
| vizwiz-finger-00182.jpg | finger | finger | 83% | auto | finger, arm, hot dog |
| vizwiz-flower-00395.jpg | flower | flowers | 67% | auto | flowers, vase, flower pot |
| vizwiz-foot-01040.jpg | foot | person | 90% | scanner (blurry) | person, foot, carpet |
| vizwiz-foot-00080.jpg | foot | clothes | 61% | auto | clothes, shoes, sneakers |
| fork-01.jpg | fork | fork | 48% | auto | fork, spoon, celery |
| fridge-10.jpg | fridge | drink | 50% | scanner | drink, soda, fridge |
| fridge-06.jpg | fridge | fridge | 74% | auto | fridge, freezer, door handle |
| fridge-05.jpg | fridge | fridge | 84% | auto | fridge, spatula, freezer |
| fridge-01.jpg | fridge | fridge | 89% | auto | fridge, freezer, ice pack |
| fridge-04.jpg | fridge | fridge | 82% | auto | fridge, freezer, aluminum foil |
| fridge-08.jpg | fridge | fridge | 58% | auto | fridge, freezer, door handle |
| fridge-09.jpg | fridge | fridge | 53% | auto | fridge, freezer, dishwasher |
| fridge-12.jpg | fridge | fridge | 50% | auto | fridge, whiteboard, freezer |
| vizwiz-glass-00808.jpg | glass | glass | 38% | scanner | glass, plastic wrap, jar |
| vizwiz-glass-00952.jpg | glass | hair | 29% | scanner | hair, leg, water |
| vizwiz-hair-00530.jpg | hair | person | 92% | scanner (blurry) | person, hair, head |
| vizwiz-heater-01064.jpg | heater | heater | 95% | auto | heater, blinds, radiator |
| vizwiz-heater-00502.jpg | heater | dresser | 49% | auto | dresser, drawer, cabinet |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | chocolate | 67% | auto | chocolate, hot chocolate, soap |
| vizwiz-jar-01056.jpg | jar | food | 72% | scanner (blurry) | food, baby food, jar |
| vizwiz-juice-00422.jpg | juice | juice | 97% | auto | juice, ID card, juice box |
| vizwiz-ketchup-00112.jpg | ketchup | ketchup | 97% | auto | ketchup, tomato, can opener |
| vizwiz-ketchup-00220.jpg | ketchup | ketchup | 72% | auto | ketchup, tomato, sausage |
| vizwiz-keyboard-00221.jpg | keyboard | phone charger | 46% | auto | phone charger, keyboard, computer mouse |
| keyboard-03.jpg | keyboard | keyboard | 94% | auto | keyboard, computer mouse, music keyboard |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 92% | auto | keyboard, laptop, calculator |
| vizwiz-keyboard-00828.jpg | keyboard | electronics | 55% | scanner | electronics, phone, computer mouse |
| keyboard-01.jpg | keyboard | keyboard | 98% | auto | keyboard, computer mouse, music keyboard |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 92% | auto | keyboard, music keyboard, computer mouse |
| knife-01.jpg | knife | knife | 97% | auto | knife, ruler, saw |
| knife-03.jpg | knife | fork | 56% | auto | fork, plate guard, weighted utensils |
| laptop-07.jpg | laptop | laptop | 62% | auto | laptop, desk, computer mouse |
| laptop-04.jpg | laptop | phone charger | 21% | scanner | phone charger, computer mouse, phone |
| laptop-05.jpg | laptop | laptop | 51% | auto | laptop, chair, desk |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 82% | auto | keyboard, laptop, music keyboard |
| laptop-06.jpg | laptop | laptop | 50% | auto | laptop, webcam, monitor |
| laptop-02.jpg | laptop | laptop | 49% | auto | laptop, keyboard, monitor |
| laptop-03.jpg | laptop | keyboard | 75% | auto | keyboard, laptop, webcam |
| vizwiz-lighter-00806.jpg | lighter | skateboard | 15% | scanner | skateboard, phone, glasses case |
| vizwiz-lotion-01072.jpg | lotion | lotion | 90% | auto | lotion, body wash, hand cream |
| vizwiz-lotion-00026.jpg | lotion | lotion | 55% | scanner (blurry) | lotion, body wash, shampoo |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | magnifying glass | 38% | scanner | magnifying glass, razor, contact lens case |
| vizwiz-mailbox-00117.jpg | mailbox | mailbox | 90% | auto | mailbox, folder, envelope |
| vizwiz-medicine-00339.jpg | medicine | medicine | 33% | scanner | medicine, pills, knife |
| microwave-01.jpg | microwave | microwave | 94% | auto | microwave, oven, chicken |
| microwave-02.jpg | microwave | microwave | 96% | auto | microwave, window, oven |
| vizwiz-milk-00704.jpg | milk | drink | 71% | scanner (blurry) | drink, milk, sports drink |
| vizwiz-money-00473.jpg | money | money | 64% | auto | money, bill, face |
| vizwiz-money-00791.jpg | money | bill | 24% | scanner (blurry) | bill, money, wallet |
| vizwiz-monitor-00663.jpg | monitor | apple | 24% | scanner (blurry) | apple, banana, phone |
| vizwiz-mug-00104.jpg | mug | mug | 58% | auto | mug, hot chocolate, cup |
| vizwiz-mustard-01033.jpg | mustard | mustard | 94% | auto | mustard, ketchup, hot dog |
| orange-01.jpg | orange | fruit | 91% | auto | fruit, fruit bowl, apple |
| orange-02.jpg | orange | orange | 77% | auto | orange, grapefruit, juice |
| oven-06.jpg | oven | stove | 85% | auto | stove, oven, pot |
| oven-04.jpg | oven | oven | 34% | scanner | oven, pizza, stove |
| oven-05.jpg | oven | oven | 54% | auto | oven, microwave, oven mitt |
| oven-07.jpg | oven | stove | 61% | auto | stove, door handle, oven |
| oven-02.jpg | oven | bread | 62% | auto | bread, butter, pie |
| oven-01.jpg | oven | food | 58% | scanner | food, bacon, meat |
| vizwiz-paper-00483.jpg | paper | bill | 22% | scanner (blurry) | bill, paper, ticket |
| vizwiz-pear-00245.jpg | pear | fruit | 84% | scanner (blurry) | fruit, apple, mango |
| vizwiz-pen-00570.jpg | pen | eraser | 32% | scanner | eraser, ruler, insulin pen |
| person-12.jpg | person | skirt | 47% | auto | skirt, dress, coat |
| person-06.jpg | person | clothes | 52% | scanner | clothes, tie, person |
| person-09.jpg | person | food | 76% | auto | food, cake, corn |
| person-10.jpg | person | teeth | 58% | auto | teeth, mouth, face |
| person-04.jpg | person | clothes | 62% | auto | clothes, bracelet, ring |
| person-05.jpg | person | clothes | 70% | auto | clothes, hat, face |
| person-02.jpg | person | person | 70% | scanner (blurry) | person, head, knee |
| person-08.jpg | person | toothbrush | 40% | scanner | toothbrush, teeth, mouth |
| vizwiz-phone-00562.jpg | phone | phone | 54% | auto | phone, DVD, phone charger |
| vizwiz-phone-01124.jpg | phone | phone | 49% | scanner (blurry) | phone, ear, DVD |
| vizwiz-phone-00274.jpg | phone | phone | 69% | scanner (blurry) | phone, guitar, phone charger |
| phone-02.jpg | phone | phone | 49% | auto | phone, landline phone, calculator |
| phone-01.jpg | phone | electronics | 54% | scanner | electronics, phone, clock |
| vizwiz-phone-01130.jpg | phone | phone | 76% | scanner (blurry) | phone, power bank, DVD |
| vizwiz-picture-00559.jpg | picture | picture | 75% | auto | picture, photo frame, arm |
| vizwiz-pill-bottle-00089.jpg | pill bottle | pill bottle | 56% | auto | pill bottle, hand cream, glue |
| vizwiz-pills-01113.jpg | pills | potato | 15% | scanner (blurry) | potato, ball, sausage |
| vizwiz-pineapple-00804.jpg | pineapple | pineapple | 76% | auto | pineapple, pumpkin, fish |
| pizza-10.jpg | pizza | pizza | 76% | auto | pizza, tomato, pie |
| pizza-08.jpg | pizza | pizza | 75% | auto | pizza, salad, bacon |
| pizza-02.jpg | pizza | salad | 75% | auto | salad, lettuce, sandwich |
| pizza-12.jpg | pizza | rice | 63% | auto | rice, pizza, pie |
| pizza-09.jpg | pizza | pizza | 77% | auto | pizza, pie, cheese |
| pizza-11.jpg | pizza | food | 74% | auto | food, pizza, honey |
| pizza-01.jpg | pizza | salad | 58% | auto | salad, lettuce, meal |
| pizza-07.jpg | pizza | pizza | 92% | auto | pizza, pie, bell pepper |
| plant-03.jpg | plant | plant | 82% | auto | plant, Christmas tree, flower pot |
| plant-01.jpg | plant | flowers | 63% | auto | flowers, flower pot, vase |
| plant-04.jpg | plant | fence | 28% | scanner | fence, gate, rain |
| vizwiz-popcorn-00412.jpg | popcorn | food | 82% | scanner (blurry) | food, chocolate, hamburger |
| vizwiz-radio-00642.jpg | radio | radio | 96% | auto | radio, phone, calculator |
| vizwiz-remote-00012.jpg | remote | remote | 77% | auto | remote, phone, calculator |
| vizwiz-remote-00387.jpg | remote | remote | 95% | auto | remote, tv, phone |
| remote-01.jpg | remote | remote | 82% | auto | remote, music keyboard, keyboard |
| vizwiz-remote-00439.jpg | remote | remote | 89% | auto | remote, tv, phone |
| sandwich-08.jpg | sandwich | sandwich | 53% | auto | sandwich, bacon, hamburger |
| sandwich-05.jpg | sandwich | lunch box | 57% | auto | lunch box, leftovers, toast |
| sandwich-12.jpg | sandwich | food | 87% | auto | food, sandwich, butter |
| sandwich-07.jpg | sandwich | hot dog | 95% | auto | hot dog, sausage, sandwich |
| sandwich-04.jpg | sandwich | hamburger | 60% | auto | hamburger, sandwich, hot dog |
| sandwich-02.jpg | sandwich | food | 81% | auto | food, sandwich, thermometer |
| sandwich-06.jpg | sandwich | sandwich | 92% | auto | sandwich, hamburger, bagel |
| sandwich-01.jpg | sandwich | food | 89% | auto | food, sandwich, chicken |
| scissors-01.jpg | scissors | razor | 61% | auto | razor, electric shaver, leg |
| vizwiz-scissors-00315.jpg | scissors | tool | 90% | scanner (blurry) | tool, scissors, razor |
| vizwiz-shampoo-00096.jpg | shampoo | shampoo | 24% | scanner | shampoo, sunscreen, mouthwash |
| vizwiz-shampoo-00631.jpg | shampoo | shampoo | 88% | auto | shampoo, conditioner, cleaning cloth |
| vizwiz-shaving-cream-00733.jpg | shaving cream | shaving cream | 94% | auto | shaving cream, razor, lotion |
| vizwiz-shaving-cream-00244.jpg | shaving cream | shaving cream | 39% | scanner | shaving cream, sunscreen, deodorant |
| vizwiz-shoes-00005.jpg | shoes | clothes | 56% | scanner (blurry) | clothes, boots, foot |
| sink-04.jpg | sink | (not sure) | 3% | scanner (blurry) |  |
| vizwiz-sink-00897.jpg | sink | sink | 89% | auto | sink, door handle, bathroom sink |
| sink-01.jpg | sink | sink | 53% | auto | sink, bathroom sink, bathtub |
| sink-03.jpg | sink | boots | 11% | scanner | boots, leg, foot |
| vizwiz-soap-00460.jpg | soap | scarf | 20% | scanner | scarf, shirt, blanket |
| vizwiz-soda-01042.jpg | soda | beer | 18% | scanner (blurry) | beer, sports drink, urinal bottle |
| vizwiz-soda-01207.jpg | soda | finger | 31% | scanner (blurry) | finger, flashlight, lighter |
| sofa-01.jpg | sofa | seat belt | 31% | scanner | seat belt, cat, sofa |
| sofa-08.jpg | sofa | sofa | 80% | auto | sofa, chair, recliner |
| sofa-06.jpg | sofa | sofa | 75% | auto | sofa, cushion, chair |
| sofa-04.jpg | sofa | cat | 74% | auto | cat, pet bed, sofa |
| sofa-03.jpg | sofa | food | 76% | auto | food, hot dog, hamburger |
| sofa-11.jpg | sofa | sofa | 91% | auto | sofa, chair, cushion |
| sofa-07.jpg | sofa | sofa | 46% | auto | sofa, sheets, mattress |
| sofa-05.jpg | sofa | bed | 57% | auto | bed, duvet, bedpan |
| sofa-10.jpg | sofa | sofa | 82% | auto | sofa, mattress, cushion |
| vizwiz-soup-00995.jpg | soup | soup | 78% | auto | soup, burrito, ladle |
| vizwiz-spinach-01009.jpg | spinach | spinach | 94% | auto | spinach, soup, lettuce |
| spoon-02.jpg | spoon | spinach | 71% | auto | spinach, green beans, celery |
| spoon-01.jpg | spoon | spoon | 95% | auto | spoon, wrench, screws |
| vizwiz-spray-bottle-00364.jpg | spray bottle | tool | 61% | scanner (blurry) | tool, glue, urinal bottle |
| vizwiz-stairs-00699.jpg | stairs | stairs | 69% | auto | stairs, ladder, bed rail |
| vizwiz-stove-00678.jpg | stove | stove | 50% | auto | stove, oven, grill |
| vizwiz-sugar-00134.jpg | sugar | sugar | 28% | scanner | sugar, soda, measuring cup |
| suitcase-03.jpg | suitcase | suitcase | 26% | scanner | suitcase, power bank, backpack |
| suitcase-05.jpg | suitcase | suitcase | 89% | auto | suitcase, DVD, purse |
| suitcase-02.jpg | suitcase | suitcase | 84% | auto | suitcase, DVD, trash bag |
| suitcase-01.jpg | suitcase | suitcase | 63% | auto | suitcase, seat belt, backpack |
| vizwiz-tablet-00105.jpg | tablet | tablet | 69% | auto | tablet, tablet stand, whiteboard |
| teddy-bear-05.jpg | teddy bear | teddy bear | 79% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 96% | auto | teddy bear, toy, honey |
| teddy-bear-02.jpg | teddy bear | teddy bear | 89% | auto | teddy bear, toy, doll |
| teddy-bear-04.jpg | teddy bear | teddy bear | 47% | scanner | teddy bear, horse, squirrel |
| vizwiz-tissues-00108.jpg | tissues | tissues | 97% | auto | tissues, plastic wrap, wipes |
| toaster-01.jpg | toaster | toaster | 84% | auto | toaster, blender, kettle |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 84% | auto | toilet paper, bandage, paper towel |
| toothbrush-01.jpg | toothbrush | toothbrush | 80% | auto | toothbrush, pepper, toothpaste |
| vizwiz-toy-00367.jpg | toy | toy | 71% | auto | toy, candy, keys |
| tv-10.jpg | tv | monitor | 64% | auto | monitor, ticket, computer |
| tv-08.jpg | tv | monitor | 71% | auto | monitor, airplane, computer |
| tv-05.jpg | tv | monitor | 67% | auto | monitor, webcam, computer |
| tv-04.jpg | tv | computer | 61% | auto | computer, tablet, monitor |
| tv-01.jpg | tv | hat | 32% | scanner | hat, rosary, tv |
| vizwiz-tv-00130.jpg | tv | tv | 90% | auto | tv, monitor, webcam |
| tv-07.jpg | tv | electronics | 87% | auto | electronics, monitor, webcam |
| tv-06.jpg | tv | tv | 62% | auto | tv, baseball bat, game console |
| umbrella-11.jpg | umbrella | umbrella | 87% | auto | umbrella, coat, rain |
| umbrella-10.jpg | umbrella | umbrella | 73% | auto | umbrella, coat, tent |
| umbrella-02.jpg | umbrella | umbrella | 57% | auto | umbrella, swimsuit, chair |
| umbrella-03.jpg | umbrella | umbrella | 73% | auto | umbrella, tent, kite |
| umbrella-12.jpg | umbrella | chopsticks | 14% | scanner | chopsticks, plastic wrap, rolling pin |
| umbrella-01.jpg | umbrella | umbrella | 96% | auto | umbrella, balloon, kite |
| umbrella-06.jpg | umbrella | umbrella | 75% | auto | umbrella, tent, boat |
| umbrella-07.jpg | umbrella | umbrella | 73% | auto | umbrella, hat, towel |
| vase-02.jpg | vase | vase | 40% | scanner | vase, glass, balloon |
| vase-04.jpg | vase | vase | 50% | auto | vase, asparagus, flowers |
| vase-01.jpg | vase | horse | 72% | auto | horse, paint, picture |
| vizwiz-water-00659.jpg | water | straw | 30% | scanner | straw, webcam, thermometer |
| water-bottle-01.jpg | water bottle | urinal bottle | 25% | scanner | urinal bottle, candy, chips |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 40% | scanner | water bottle, urinal bottle, water |
| vizwiz-wine-00669.jpg | wine | urinal bottle | 23% | scanner | urinal bottle, mouthwash, body wash |
| vizwiz-wine-00946.jpg | wine | wine | 12% | scanner (blurry) | wine, bill, glass |
| vizwiz-wine-01068.jpg | wine | wine | 31% | scanner (blurry) | wine, glass, beer |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 77% | auto | glass, wine glass, wine |
| wine-glass-02.jpg | wine glass | wine | 63% | auto | wine, honey, glass |
| vizwiz-yogurt-01051.jpg | yogurt | carpet | 53% | auto | carpet, rug, cleaning cloth |

### test-images-public/dev, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 277 | 53% | 72% | 69% | 21% | 10% | 1% | 709 / 1386 | 763 | vocab 274, none 3 |
| coco | 172 | 51% | 71% | 79% | 27% | 8% | 1% | 698 / 1370 | 746 | vocab 170, none 2 |
| cluttered | 131 | 46% | 67% | 79% | 30% | 9% | 2% | 703 / 1390 | 752 | vocab 129, none 2 |
| fruit | 12 | 58% | 100% | 67% | 0% | 42% | 0% | 550 / 1101 | 597 | vocab 12 |
| held | 105 | 55% | 73% | 52% | 10% | 12% | 1% | 727 / 1386 | 791 | vocab 104, none 1 |
| vizwiz | 105 | 55% | 73% | 52% | 10% | 12% | 1% | 727 / 1386 | 791 | vocab 104, none 1 |
| food & meals | 34 | 53% | 71% | 82% | 26% | 18% | 0% | 672 / 1601 | 723 | vocab 34 |
| clothes & accessories | 11 | 82% | 82% | 82% | 0% | 9% | 0% | 664 / 979 | 712 | vocab 11 |
| table | 41 | 68% | 83% | 78% | 17% | 5% | 0% | 681 / 956 | 728 | vocab 41 |
| single | 41 | 68% | 83% | 78% | 17% | 5% | 0% | 681 / 956 | 728 | vocab 41 |
| furniture & home | 48 | 42% | 63% | 77% | 33% | 8% | 2% | 715 / 1614 | 775 | vocab 47, none 1 |
| drinks | 16 | 25% | 44% | 25% | 13% | 13% | 0% | 976 / 1600 | 1051 | vocab 16 |
| office & reading | 5 | 40% | 80% | 0% | 0% | 0% | 0% | 746 / 1122 | 804 | vocab 5 |
| kitchen & dining | 46 | 50% | 65% | 70% | 26% | 0% | 2% | 725 / 1344 | 781 | vocab 45, none 1 |
| vegetables | 7 | 100% | 100% | 100% | 0% | 0% | 0% | 299 / 340 | 354 | vocab 7 |
| pets & animals | 18 | 44% | 100% | 67% | 22% | 17% | 0% | 723 / 1151 | 770 | vocab 18 |
| electronics & media | 28 | 54% | 68% | 86% | 29% | 7% | 0% | 648 / 1388 | 700 | vocab 28 |
| bathroom & hygiene | 13 | 77% | 77% | 62% | 8% | 0% | 8% | 767 / 1139 | 827 | none 1, vocab 12 |
| cleaning & laundry | 2 | 50% | 50% | 50% | 0% | 0% | 0% | 437 / 581 | 495 | vocab 2 |
| people & body | 12 | 17% | 42% | 50% | 42% | 25% | 0% | 887 / 1390 | 934 | vocab 12 |
| outdoors & travel | 1 | 100% | 100% | 100% | 0% | 0% | 0% | 294 / 294 | 330 | vocab 1 |
| tools & household | 3 | 33% | 67% | 33% | 0% | 33% | 0% | 563 / 817 | 606 | vocab 3 |
| health & medical | 3 | 67% | 67% | 33% | 0% | 0% | 0% | 872 / 915 | 915 | vocab 3 |
| personal items | 13 | 85% | 100% | 62% | 0% | 0% | 0% | 798 / 1137 | 847 | vocab 13 |
| leisure & play | 5 | 100% | 100% | 80% | 0% | 0% | 0% | 576 / 949 | 625 | vocab 5 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| apple-01.jpg | apple | apple | 95% | auto | apple, fruit bowl, peach |
| apple-03.jpg | apple | fruit | 97% | scanner (blurry) | fruit, apple, onion |
| vizwiz-apple-00689.jpg | apple | apple | 46% | auto | apple, pear, peach |
| vizwiz-baby-food-00943.jpg | baby food | baby food | 69% | auto | baby food, juice, jam |
| backpack-01.jpg | backpack | backpack | 89% | auto | backpack, jacket, laptop |
| vizwiz-backpack-00499.jpg | backpack | backpack | 55% | auto | backpack, blanket, shoulder |
| banana-04.jpg | banana | banana | 64% | auto | banana, apple, fruit bowl |
| banana-01.jpg | banana | fruit | 97% | scanner (blurry) | fruit, banana, fruit bowl |
| banana-06.jpg | banana | fruit | 78% | scanner (blurry) | fruit, banana, pineapple |
| banana-05.jpg | banana | banana | 99% | auto | banana, lime, Christmas tree |
| banana-02.jpg | banana | banana | 72% | auto | banana, arm, leg |
| bed-12.jpg | bed | bed | 54% | auto | bed, sheets, bedpan |
| bed-04.jpg | bed | blanket | 61% | auto | blanket, bed, sheets |
| bed-03.jpg | bed | first aid kit | 35% | scanner | first aid kit, book, suitcase |
| bed-10.jpg | bed | bicycle | 70% | auto | bicycle, steering wheel, fork |
| bed-11.jpg | bed | furniture | 63% | auto | furniture, blanket, cat |
| bed-06.jpg | bed | curtains | 51% | auto | curtains, bed, bedpan |
| bed-01.jpg | bed | mattress | 70% | auto | mattress, heating pad, bed |
| bed-05.jpg | bed | sheets | 47% | auto | sheets, duvet, mattress |
| vizwiz-bed-00316.jpg | bed | pillow | 58% | auto | pillow, sheets, blanket |
| bed-09.jpg | bed | rug | 45% | auto | rug, carpet, blanket |
| vizwiz-beer-00319.jpg | beer | drink | 80% | auto | drink, can, urinal bottle |
| vizwiz-blanket-00757.jpg | blanket | blanket | 24% | scanner | blanket, cleaning cloth, washcloth |
| book-01.jpg | book | book | 40% | scanner | book, duck, magazine |
| book-02.jpg | book | crayons | 38% | scanner | crayons, book, bookshelf |
| bowl-12.jpg | bowl | leftovers | 85% | auto | leftovers, salad, lunch box |
| bowl-04.jpg | bowl | noodles | 59% | auto | noodles, soup, chopsticks |
| bowl-02.jpg | bowl | noodles | 47% | auto | noodles, pasta, broccoli |
| bowl-09.jpg | bowl | food | 54% | scanner | food, meal, soup |
| bowl-01.jpg | bowl | broccoli | 91% | auto | broccoli, soup, cauliflower |
| bowl-07.jpg | bowl | fruit | 60% | scanner | fruit, banana, orange |
| bowl-05.jpg | bowl | food | 74% | auto | food, meal, hamburger |
| bowl-10.jpg | bowl | food | 59% | scanner | food, salad, lunch box |
| vizwiz-box-01128.jpg | box | box | 26% | scanner (blurry) | box, leg, package |
| vizwiz-box-00401.jpg | box | package | 53% | scanner | package, box, tissues |
| broccoli-03.jpg | broccoli | broccoli | 91% | auto | broccoli, cauliflower, spinach |
| broccoli-01.jpg | broccoli | broccoli | 91% | auto | broccoli, cauliflower, salad |
| cake-07.jpg | cake | pie | 83% | auto | pie, bread, meal |
| cake-03.jpg | cake | cake | 83% | auto | cake, cupcake, peas |
| vizwiz-cake-01066.jpg | cake | food | 56% | scanner | food, donut, credit card |
| cake-05.jpg | cake | bath mat | 61% | auto | bath mat, rug, carpet |
| cake-02.jpg | cake | cake | 75% | auto | cake, flower pot, flowers |
| cake-01.jpg | cake | cake | 98% | scanner (blurry) | cake, birthday cake, cupcake |
| vizwiz-can-00840.jpg | can | soda | 22% | scanner | soda, can, measuring cup |
| vizwiz-can-01184.jpg | can | soda | 24% | scanner | soda, can opener, baby food |
| vizwiz-carpet-00984.jpg | carpet | leg | 13% | scanner (blurry) | leg, arm, shoulder |
| carrot-01.jpg | carrot | carrot | 95% | auto | carrot, peeler, garden |
| carrot-03.jpg | carrot | carrot | 98% | auto | carrot, sweet potato, peeler |
| carrot-02.jpg | carrot | carrot | 97% | auto | carrot, sweet potato, peeler |
| cat-10.jpg | cat | cat | 93% | auto | cat, hair, mittens |
| cat-11.jpg | cat | cat | 90% | auto | cat, hair, mittens |
| cat-01.jpg | cat | cat | 35% | scanner | cat, mittens, pulse oximeter |
| cat-02.jpg | cat | cat | 80% | auto | cat, pet bed, orange |
| cat-05.jpg | cat | animal | 87% | auto | animal, cat, rabbit |
| cat-12.jpg | cat | cat | 63% | auto | cat, hamster, mittens |
| cat-03.jpg | cat | clothes | 67% | scanner (blurry) | clothes, hat, cat |
| cat-07.jpg | cat | ear | 76% | auto | ear, cat, hearing aid |
| chair-10.jpg | chair | guitar | 29% | scanner | guitar, harmonica, violin |
| chair-07.jpg | chair | chair | 67% | auto | chair, armchair, sofa |
| chair-08.jpg | chair | desk | 27% | scanner | desk, notebook, table |
| chair-01.jpg | chair | cushion | 51% | auto | cushion, chair, pillow |
| chair-02.jpg | chair | mirror | 82% | auto | mirror, chair, pillow |
| chair-04.jpg | chair | furniture | 66% | auto | furniture, chair, keyboard |
| vizwiz-chair-00859.jpg | chair | furniture | 55% | scanner | furniture, chair, monitor |
| chair-05.jpg | chair | chair | 58% | auto | chair, armchair, recliner |
| clock-01.jpg | clock | clock | 95% | auto | clock, door handle, watch |
| clock-04.jpg | clock | clock | 91% | auto | clock, watch, kitchen timer |
| clock-03.jpg | clock | clock | 61% | auto | clock, watch, knife |
| clock-05.jpg | clock | thermometer | 80% | auto | thermometer, kitchen timer, clock |
| vizwiz-coffee-00937.jpg | coffee | mug | 46% | auto | mug, travel mug, cup |
| vizwiz-coffee-00561.jpg | coffee | microwave | 33% | scanner | microwave, mustard, pepper |
| vizwiz-coffee-maker-00085.jpg | coffee maker | coffee maker | 89% | auto | coffee maker, stomach, blender |
| vizwiz-computer-mouse-00672.jpg | computer mouse | computer mouse | 98% | auto | computer mouse, webcam, flashlight |
| vizwiz-conditioner-00177.jpg | conditioner | (not sure) | 7% | scanner |  |
| vizwiz-conditioner-00384.jpg | conditioner | hand cream | 60% | auto | hand cream, carpet, sunscreen |
| vizwiz-cookie-00772.jpg | cookie | food | 97% | scanner (blurry) | food, cookie, sponge |
| vizwiz-corn-01008.jpg | corn | corn | 78% | auto | corn, popcorn, candy |
| vizwiz-crackers-00558.jpg | crackers | hand | 15% | scanner | hand, juice, finger |
| cup-03.jpg | cup | drink | 76% | scanner (blurry) | drink, juice, honey |
| vizwiz-cup-00857.jpg | cup | mug | 49% | auto | mug, cup, measuring cup |
| cup-01.jpg | cup | soda | 50% | auto | soda, cup, can |
| vizwiz-cup-00247.jpg | cup | cup | 61% | scanner (blurry) | cup, coffee, measuring cup |
| vizwiz-deodorant-00556.jpg | deodorant | deodorant | 65% | auto | deodorant, board game, matches |
| dog-11.jpg | dog | animal | 54% | scanner | animal, dog, dog leash |
| dog-04.jpg | dog | dog leash | 77% | auto | dog leash, medical alert button, dog |
| vizwiz-dog-00025.jpg | dog | dog leash | 32% | scanner | dog leash, dog, hot dog |
| dog-09.jpg | dog | beer | 55% | auto | beer, dog, shampoo |
| dog-08.jpg | dog | dog | 61% | auto | dog, hot dog, teeth |
| dog-12.jpg | dog | animal | 55% | scanner | animal, dog, dog leash |
| dog-07.jpg | dog | dog | 55% | auto | dog, hot dog, grass |
| dog-02.jpg | dog | dog | 74% | auto | dog, hair, hot dog |
| vizwiz-dog-00318.jpg | dog | dog leash | 47% | auto | dog leash, dog, hot dog |
| dog-01.jpg | dog | vest | 25% | scanner | vest, dog, hot dog |
| donut-02.jpg | donut | donut | 71% | auto | donut, bagel, squirrel |
| donut-01.jpg | donut | donut | 96% | auto | donut, cake, bagel |
| vizwiz-door-00190.jpg | door | shower | 14% | scanner (blurry) | shower, door handle, airplane |
| vizwiz-dresser-00569.jpg | dresser | furniture | 90% | auto | furniture, drawer, door handle |
| vizwiz-drying-rack-00329.jpg | drying rack | drying rack | 60% | auto | drying rack, shoe rack, hanger |
| vizwiz-finger-00182.jpg | finger | finger | 83% | auto | finger, arm, hot dog |
| vizwiz-flower-00395.jpg | flower | flowers | 46% | auto | flowers, flower, flower pot |
| vizwiz-foot-01040.jpg | foot | person | 90% | scanner (blurry) | person, foot, carpet |
| vizwiz-foot-00080.jpg | foot | clothes | 61% | auto | clothes, shoes, leg |
| fork-01.jpg | fork | fork | 48% | auto | fork, paper, weighted utensils |
| fridge-10.jpg | fridge | soda | 26% | scanner | soda, fridge, juice |
| fridge-06.jpg | fridge | fridge | 73% | auto | fridge, freezer, door handle |
| fridge-05.jpg | fridge | fridge | 84% | auto | fridge, knife, freezer |
| fridge-01.jpg | fridge | freezer | 49% | auto | freezer, fridge, drawer |
| fridge-04.jpg | fridge | fridge | 84% | auto | fridge, freezer, aluminum foil |
| fridge-08.jpg | fridge | fridge | 58% | auto | fridge, freezer, door handle |
| fridge-09.jpg | fridge | fridge | 53% | auto | fridge, freezer, dishwasher |
| fridge-12.jpg | fridge | fridge | 66% | auto | fridge, toilet, freezer |
| vizwiz-glass-00808.jpg | glass | glass | 35% | scanner | glass, water, jar |
| vizwiz-glass-00952.jpg | glass | hair | 29% | scanner | hair, leg, water |
| vizwiz-hair-00530.jpg | hair | person | 92% | scanner (blurry) | person, hair, head |
| vizwiz-heater-01064.jpg | heater | heater | 95% | auto | heater, blinds, radiator |
| vizwiz-heater-00502.jpg | heater | heater | 61% | auto | heater, dresser, finger |
| vizwiz-hot-chocolate-00198.jpg | hot chocolate | chocolate | 67% | auto | chocolate, hot chocolate, soap |
| vizwiz-jar-01056.jpg | jar | food | 72% | scanner (blurry) | food, baby food, jar |
| vizwiz-juice-00422.jpg | juice | juice | 97% | auto | juice, ID card, juice box |
| vizwiz-ketchup-00112.jpg | ketchup | ketchup | 99% | auto | ketchup, tomato, jam |
| vizwiz-ketchup-00220.jpg | ketchup | ketchup | 99% | auto | ketchup, tomato, glue |
| vizwiz-keyboard-00221.jpg | keyboard | phone charger | 46% | auto | phone charger, keyboard, computer mouse |
| keyboard-03.jpg | keyboard | keyboard | 95% | auto | keyboard, music keyboard, computer mouse |
| vizwiz-keyboard-00187.jpg | keyboard | keyboard | 91% | auto | keyboard, music keyboard, calculator |
| vizwiz-keyboard-00828.jpg | keyboard | electronics | 55% | scanner | electronics, phone, computer mouse |
| keyboard-01.jpg | keyboard | keyboard | 98% | auto | keyboard, computer mouse, music keyboard |
| vizwiz-keyboard-00128.jpg | keyboard | keyboard | 92% | auto | keyboard, music keyboard, computer mouse |
| knife-01.jpg | knife | knife | 97% | auto | knife, ruler, saw |
| knife-03.jpg | knife | fork | 31% | scanner | fork, tongs, zucchini |
| laptop-07.jpg | laptop | keyboard | 76% | auto | keyboard, laptop, computer mouse |
| laptop-04.jpg | laptop | keyboard | 16% | scanner | keyboard, computer mouse, laptop |
| laptop-05.jpg | laptop | laptop | 51% | auto | laptop, chair, desk |
| vizwiz-laptop-01164.jpg | laptop | keyboard | 82% | auto | keyboard, laptop, music keyboard |
| laptop-06.jpg | laptop | laptop | 50% | auto | laptop, webcam, monitor |
| laptop-02.jpg | laptop | laptop | 58% | auto | laptop, keyboard, computer |
| laptop-03.jpg | laptop | keyboard | 52% | auto | keyboard, webcam, computer mouse |
| vizwiz-lighter-00806.jpg | lighter | skateboard | 39% | scanner | skateboard, ceiling light, glasses case |
| vizwiz-lotion-01072.jpg | lotion | lotion | 70% | auto | lotion, candy, body wash |
| vizwiz-lotion-00026.jpg | lotion | lotion | 55% | scanner (blurry) | lotion, body wash, shampoo |
| vizwiz-magnifying-glass-01105.jpg | magnifying glass | magnifying glass | 38% | scanner | magnifying glass, razor, contact lens case |
| vizwiz-mailbox-00117.jpg | mailbox | mailbox | 90% | auto | mailbox, folder, envelope |
| vizwiz-medicine-00339.jpg | medicine | medicine | 33% | scanner | medicine, pills, knife |
| microwave-01.jpg | microwave | microwave | 94% | auto | microwave, oven, chicken |
| microwave-02.jpg | microwave | microwave | 96% | auto | microwave, window, oven |
| vizwiz-milk-00704.jpg | milk | drink | 71% | scanner (blurry) | drink, milk, sports drink |
| vizwiz-money-00473.jpg | money | money | 64% | auto | money, bill, face |
| vizwiz-money-00791.jpg | money | bill | 24% | scanner (blurry) | bill, money, wallet |
| vizwiz-monitor-00663.jpg | monitor | apple | 24% | scanner (blurry) | apple, banana, phone |
| vizwiz-mug-00104.jpg | mug | mug | 58% | auto | mug, hot chocolate, cup |
| vizwiz-mustard-01033.jpg | mustard | mustard | 94% | auto | mustard, ketchup, hot dog |
| orange-01.jpg | orange | fruit | 93% | auto | fruit, orange, pumpkin |
| orange-02.jpg | orange | orange | 71% | auto | orange, grapefruit, lemon |
| oven-06.jpg | oven | stove | 84% | auto | stove, oven, grill |
| oven-04.jpg | oven | oven | 34% | scanner | oven, pizza, stove |
| oven-05.jpg | oven | oven | 54% | auto | oven, microwave, oven mitt |
| oven-07.jpg | oven | stove | 61% | auto | stove, oven, door handle |
| oven-02.jpg | oven | bread | 65% | auto | bread, butter, pie |
| oven-01.jpg | oven | food | 58% | scanner | food, bacon, meat |
| vizwiz-paper-00483.jpg | paper | bill | 22% | scanner (blurry) | bill, paper, ticket |
| vizwiz-pear-00245.jpg | pear | fruit | 98% | scanner (blurry) | fruit, mango, pear |
| vizwiz-pen-00570.jpg | pen | eraser | 32% | scanner | eraser, ruler, insulin pen |
| person-12.jpg | person | skirt | 46% | auto | skirt, dress, suit |
| person-06.jpg | person | clothes | 52% | scanner | clothes, tie, person |
| person-09.jpg | person | food | 76% | auto | food, cake, child |
| person-10.jpg | person | teeth | 59% | auto | teeth, mouth, face |
| person-04.jpg | person | ring | 25% | scanner | ring, phone, bracelet |
| person-05.jpg | person | clothes | 70% | auto | clothes, hat, face |
| person-02.jpg | person | person | 87% | scanner (blurry) | person, head, knee |
| person-08.jpg | person | toothbrush | 40% | scanner | toothbrush, teeth, mouth |
| vizwiz-phone-00562.jpg | phone | phone | 62% | auto | phone, phone charger, webcam |
| vizwiz-phone-01124.jpg | phone | phone | 49% | scanner (blurry) | phone, ear, DVD |
| vizwiz-phone-00274.jpg | phone | phone | 54% | scanner (blurry) | phone, flashlight, lighter |
| phone-02.jpg | phone | phone | 89% | auto | phone, sunglasses, cordless phone |
| phone-01.jpg | phone | electronics | 54% | scanner | electronics, phone, calculator |
| vizwiz-phone-01130.jpg | phone | phone | 76% | scanner (blurry) | phone, power bank, DVD |
| vizwiz-picture-00559.jpg | picture | picture | 75% | auto | picture, towel, photo frame |
| vizwiz-pill-bottle-00089.jpg | pill bottle | pill bottle | 83% | auto | pill bottle, pills, liquid medicine |
| vizwiz-pills-01113.jpg | pills | potato | 15% | scanner (blurry) | potato, ball, sausage |
| vizwiz-pineapple-00804.jpg | pineapple | pineapple | 76% | auto | pineapple, pumpkin, fish |
| pizza-10.jpg | pizza | pizza | 63% | auto | pizza, tomato, spinach |
| pizza-08.jpg | pizza | pizza | 75% | auto | pizza, bacon, pie |
| pizza-02.jpg | pizza | salad | 81% | auto | salad, lettuce, spinach |
| pizza-12.jpg | pizza | pizza | 51% | auto | pizza, rice, pie |
| pizza-09.jpg | pizza | pizza | 85% | auto | pizza, pie, mushroom |
| pizza-11.jpg | pizza | food | 74% | auto | food, pizza, meal |
| pizza-01.jpg | pizza | salad | 58% | auto | salad, lettuce, sandwich |
| pizza-07.jpg | pizza | pizza | 92% | auto | pizza, pie, bell pepper |
| plant-03.jpg | plant | plant | 82% | auto | plant, flower pot, pear |
| plant-01.jpg | plant | flowers | 69% | auto | flowers, flower pot, vase |
| plant-04.jpg | plant | (not sure) | 10% | scanner |  |
| vizwiz-popcorn-00412.jpg | popcorn | food | 82% | scanner (blurry) | food, chocolate, hamburger |
| vizwiz-radio-00642.jpg | radio | radio | 96% | auto | radio, phone, calculator |
| vizwiz-remote-00012.jpg | remote | remote | 77% | auto | remote, phone, calculator |
| vizwiz-remote-00387.jpg | remote | remote | 95% | auto | remote, tv, phone |
| remote-01.jpg | remote | remote | 86% | auto | remote, game controller, tv |
| vizwiz-remote-00439.jpg | remote | remote | 94% | auto | remote, tv, phone |
| sandwich-08.jpg | sandwich | hamburger | 61% | auto | hamburger, sandwich, bacon |
| sandwich-05.jpg | sandwich | lunch box | 57% | auto | lunch box, leftovers, toast |
| sandwich-12.jpg | sandwich | sandwich | 52% | auto | sandwich, toast, meal |
| sandwich-07.jpg | sandwich | hot dog | 95% | auto | hot dog, sausage, sandwich |
| sandwich-04.jpg | sandwich | hamburger | 58% | auto | hamburger, sandwich, hot dog |
| sandwich-02.jpg | sandwich | food | 84% | auto | food, bread, thermometer |
| sandwich-06.jpg | sandwich | sandwich | 91% | auto | sandwich, bagel, hamburger |
| sandwich-01.jpg | sandwich | food | 86% | auto | food, sandwich, chicken |
| scissors-01.jpg | scissors | scissors | 84% | auto | scissors, razor, knife |
| vizwiz-scissors-00315.jpg | scissors | tool | 90% | scanner (blurry) | tool, scissors, razor |
| vizwiz-shampoo-00096.jpg | shampoo | shampoo | 24% | scanner | shampoo, sunscreen, mouthwash |
| vizwiz-shampoo-00631.jpg | shampoo | shampoo | 88% | auto | shampoo, conditioner, cleaning cloth |
| vizwiz-shaving-cream-00733.jpg | shaving cream | shaving cream | 94% | auto | shaving cream, razor, lotion |
| vizwiz-shaving-cream-00244.jpg | shaving cream | shaving cream | 39% | scanner | shaving cream, sunscreen, deodorant |
| vizwiz-shoes-00005.jpg | shoes | clothes | 56% | scanner (blurry) | clothes, boots, foot |
| sink-04.jpg | sink | (not sure) | 8% | scanner (blurry) |  |
| vizwiz-sink-00897.jpg | sink | sink | 89% | auto | sink, door handle, bathroom sink |
| sink-01.jpg | sink | sink | 90% | auto | sink, milk, bathroom sink |
| sink-03.jpg | sink | leg | 3% | scanner | leg, boots, foot |
| vizwiz-soap-00460.jpg | soap | scarf | 20% | scanner | scarf, shirt, blanket |
| vizwiz-soda-01042.jpg | soda | beer | 18% | scanner (blurry) | beer, urinal bottle, sports drink |
| vizwiz-soda-01207.jpg | soda | finger | 31% | scanner (blurry) | finger, flashlight, lighter |
| sofa-01.jpg | sofa | cat | 21% | scanner | cat, rabbit, pet bed |
| sofa-08.jpg | sofa | sofa | 89% | auto | sofa, cushion, chair |
| sofa-06.jpg | sofa | sofa | 77% | auto | sofa, cushion, mattress |
| sofa-04.jpg | sofa | cat | 69% | auto | cat, remote, orange |
| sofa-03.jpg | sofa | food | 82% | auto | food, hamburger, meal |
| sofa-11.jpg | sofa | sofa | 91% | auto | sofa, pet bed, cushion |
| sofa-07.jpg | sofa | sofa | 53% | auto | sofa, recliner, chair |
| sofa-05.jpg | sofa | bed | 57% | auto | bed, mattress, bedpan |
| sofa-10.jpg | sofa | sofa | 61% | auto | sofa, carpet, sewing kit |
| vizwiz-soup-00995.jpg | soup | soup | 78% | auto | soup, burrito, ladle |
| vizwiz-spinach-01009.jpg | spinach | spinach | 94% | auto | spinach, soup, lettuce |
| spoon-02.jpg | spoon | spinach | 71% | auto | spinach, green beans, peas |
| spoon-01.jpg | spoon | spoon | 95% | auto | spoon, phone charger, wrench |
| vizwiz-spray-bottle-00364.jpg | spray bottle | tool | 61% | scanner (blurry) | tool, glue, urinal bottle |
| vizwiz-stairs-00699.jpg | stairs | stairs | 69% | auto | stairs, ladder, bed rail |
| vizwiz-stove-00678.jpg | stove | stove | 50% | auto | stove, oven, grill |
| vizwiz-sugar-00134.jpg | sugar | sugar | 28% | scanner | sugar, soda, measuring cup |
| suitcase-03.jpg | suitcase | suitcase | 70% | auto | suitcase, speaker, power bank |
| suitcase-05.jpg | suitcase | suitcase | 89% | auto | suitcase, DVD, purse |
| suitcase-02.jpg | suitcase | suitcase | 82% | auto | suitcase, rain, DVD |
| suitcase-01.jpg | suitcase | suitcase | 63% | auto | suitcase, seat belt, backpack |
| vizwiz-tablet-00105.jpg | tablet | tablet | 69% | auto | tablet, tablet stand, whiteboard |
| teddy-bear-05.jpg | teddy bear | teddy bear | 72% | auto | teddy bear, toy, doll |
| teddy-bear-06.jpg | teddy bear | teddy bear | 94% | auto | teddy bear, honey, toy |
| teddy-bear-02.jpg | teddy bear | teddy bear | 89% | auto | teddy bear, toy, doll |
| teddy-bear-04.jpg | teddy bear | teddy bear | 47% | scanner | teddy bear, horse, squirrel |
| vizwiz-tissues-00108.jpg | tissues | tissues | 97% | auto | tissues, plastic wrap, wipes |
| toaster-01.jpg | toaster | toaster | 99% | auto | toaster, blender, toast |
| vizwiz-toilet-paper-00523.jpg | toilet paper | toilet paper | 84% | auto | toilet paper, bandage, paper towel |
| toothbrush-01.jpg | toothbrush | toothbrush | 80% | auto | toothbrush, ketchup, glue |
| vizwiz-toy-00367.jpg | toy | toy | 71% | auto | toy, candy, keys |
| tv-10.jpg | tv | monitor | 64% | auto | monitor, ticket, computer |
| tv-08.jpg | tv | monitor | 71% | auto | monitor, airplane, computer |
| tv-05.jpg | tv | monitor | 67% | auto | monitor, paper, computer |
| tv-04.jpg | tv | computer | 46% | auto | computer, monitor, desk |
| tv-01.jpg | tv | hat | 24% | scanner | hat, rosary, tie |
| vizwiz-tv-00130.jpg | tv | tv | 90% | auto | tv, monitor, webcam |
| tv-07.jpg | tv | electronics | 87% | auto | electronics, monitor, clock |
| tv-06.jpg | tv | tv | 62% | auto | tv, baseball bat, game console |
| umbrella-11.jpg | umbrella | umbrella | 88% | auto | umbrella, shirt, rain |
| umbrella-10.jpg | umbrella | umbrella | 98% | auto | umbrella, coat, hat |
| umbrella-02.jpg | umbrella | umbrella | 81% | auto | umbrella, swimsuit, shower chair |
| umbrella-03.jpg | umbrella | umbrella | 81% | auto | umbrella, kite, tent |
| umbrella-12.jpg | umbrella | lipstick | 19% | scanner | lipstick, plastic wrap, mouth |
| umbrella-01.jpg | umbrella | umbrella | 93% | auto | umbrella, balloon, kite |
| umbrella-06.jpg | umbrella | umbrella | 75% | auto | umbrella, tent, kite |
| umbrella-07.jpg | umbrella | umbrella | 73% | auto | umbrella, hat, towel |
| vase-02.jpg | vase | glass | 61% | auto | glass, vase, honey |
| vase-04.jpg | vase | vase | 50% | auto | vase, green beans, flowers |
| vase-01.jpg | vase | horse | 49% | auto | horse, plate, paint |
| vizwiz-water-00659.jpg | water | straw | 30% | scanner | straw, webcam, thermometer |
| water-bottle-01.jpg | water bottle | urinal bottle | 25% | scanner | urinal bottle, plastic wrap, money |
| vizwiz-water-bottle-00049.jpg | water bottle | water bottle | 40% | scanner | water bottle, water, urinal bottle |
| vizwiz-wine-00669.jpg | wine | urinal bottle | 23% | scanner | urinal bottle, beer, mouthwash |
| vizwiz-wine-00946.jpg | wine | wine | 12% | scanner (blurry) | wine, bill, glass |
| vizwiz-wine-01068.jpg | wine | wine | 31% | scanner (blurry) | wine, glass, beer |
| vizwiz-wine-glass-00403.jpg | wine glass | glass | 77% | auto | glass, wine glass, wine |
| wine-glass-02.jpg | wine glass | wine | 63% | auto | wine, glass, juice |
| vizwiz-yogurt-01051.jpg | yogurt | carpet | 53% | auto | carpet, rug, cleaning cloth |
