# Cue recognition eval

## webgpu (2026-10-04, 232 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 94 / 161 | 132 | vocab 22, none 3 |
| single | 13 | 92% | 92% | 77% | 0% | 0% | 8% | 85 / 129 | 131 | vocab 12, none 1 |
| cluttered | 5 | 60% | 100% | 60% | 20% | 0% | 0% | 98 / 178 | 129 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 94 / 115 | 123 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 67% | 121 / 161 | 152 | none 2, vocab 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | mug | 54% | auto | mug, cup, coffee |
| water-bottle-01.jpg | water bottle | water bottle | 13% | scanner | water bottle, glass, cup |
| glasses-01.jpg | glasses | glasses | 64% | auto | glasses, sunglasses, glass |
| phone-01.jpg | phone | phone | 69% | auto | phone, ticket, remote |
| remote-01.jpg | remote | remote | 51% | auto | remote, donut, lighter |
| toothbrush-01.jpg | toothbrush | toothbrush | 41% | scanner | toothbrush, toothpaste, comb |
| pill-bottle-01.jpg | pills | (not sure) | 12% | scanner |  |
| book-01.jpg | book | book | 65% | auto | book, newspaper, notebook |
| spoon-01.jpg | spoon | spoon | 94% | auto | spoon, rope, spatula |
| shoe-01.jpg | shoe | shoes | 49% | auto | shoes, sneakers, shoelaces |
| keys-01.jpg | keys | keys | 78% | auto | keys, padlock, fork |
| chair-01.jpg | chair | chair | 51% | auto | chair, stool, table |
| banana-01.jpg | banana | banana | 79% | auto | banana, corn, lemon |
| cluttered-desk-cup-01.jpg | cup | mug | 32% | scanner | mug, cup, coffee |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 53% | auto | laptop, dice, monitor |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 57% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | keyboard | 55% | auto | keyboard, laptop, notebook |
| cluttered-desk-monitor-01.jpg | monitor | desk | 29% | scanner | desk, bill, monitor |
| held-apple-01.jpg | apple | apple | 85% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 47% | auto | phone, remote, finger |
| held-mug-01.jpg | mug | mug | 54% | auto | mug, cup, coffee |
| held-keys-01.jpg | keys | keys | 66% | auto | keys, finger, hand |
| ood-theremin-01.jpg | theremin | (not sure) | 10% | scanner |  |
| ood-sextant-01.jpg | sextant | (not sure) | 9% | scanner |  |
| ood-astrolabe-01.jpg | astrolabe | drum | 34% | scanner | drum, CD, pie |

### test-images, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 80% | 80% | 76% | 0% | 0% | 8% | 88 / 126 | 120 | vocab 23, none 2 |
| single | 13 | 85% | 85% | 85% | 0% | 0% | 0% | 84 / 126 | 117 | vocab 13 |
| cluttered | 5 | 100% | 100% | 80% | 0% | 0% | 0% | 101 / 119 | 133 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 59 / 113 | 88 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 67% | 122 / 165 | 155 | none 2, vocab 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | mug | 67% | auto | mug, cup, coffee |
| water-bottle-01.jpg | water bottle | glass | 14% | scanner | glass, cup, ticket |
| glasses-01.jpg | glasses | glasses | 48% | auto | glasses, sunglasses, glass |
| phone-01.jpg | phone | phone | 69% | auto | phone, ticket, remote |
| remote-01.jpg | remote | remote | 51% | auto | remote, donut, lighter |
| toothbrush-01.jpg | toothbrush | toothbrush | 57% | auto | toothbrush, comb, paintbrush |
| pill-bottle-01.jpg | pills | salt | 22% | scanner | salt, cup, jar |
| book-01.jpg | book | book | 67% | auto | book, newspaper, e-reader |
| spoon-01.jpg | spoon | spoon | 94% | auto | spoon, rope, spatula |
| shoe-01.jpg | shoe | shoes | 74% | auto | shoes, sneakers, shoelaces |
| keys-01.jpg | keys | keys | 73% | auto | keys, padlock, fork |
| chair-01.jpg | chair | chair | 50% | auto | chair, stool, fork |
| banana-01.jpg | banana | banana | 99% | auto | banana, corn, lemon |
| cluttered-desk-cup-01.jpg | cup | mug | 32% | scanner | mug, cup, coffee |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 53% | auto | laptop, map, monitor |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 55% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | laptop | 45% | auto | laptop, keyboard, notebook |
| cluttered-desk-monitor-01.jpg | monitor | monitor | 63% | auto | monitor, photo frame, tv |
| held-apple-01.jpg | apple | apple | 57% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 57% | auto | phone, remote, lime |
| held-mug-01.jpg | mug | cup | 52% | auto | cup, mug, drum |
| held-keys-01.jpg | keys | keys | 66% | auto | keys, finger, hand |
| ood-theremin-01.jpg | theremin | (not sure) | 8% | scanner |  |
| ood-sextant-01.jpg | sextant | (not sure) | 9% | scanner |  |
| ood-astrolabe-01.jpg | astrolabe | drum | 34% | scanner | drum, CD, pie |

### test-images, confidence sweep (centre aim)

| threshold | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 25 | 72% | 76% | 84% | 16% | 0% | 12% | 73 / 125 | 105 | vocab 22, none 3 |
| 0.2 | 25 | 72% | 80% | 80% | 12% | 0% | 12% | 79 / 161 | 111 | vocab 22, none 3 |
| 0.25 | 25 | 72% | 80% | 80% | 12% | 0% | 12% | 78 / 162 | 110 | vocab 22, none 3 |
| 0.3 | 25 | 76% | 84% | 80% | 8% | 0% | 12% | 82 / 164 | 114 | vocab 22, none 3 |
| 0.35 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 83 / 162 | 115 | vocab 22, none 3 |
| 0.4 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 89 / 162 | 120 | vocab 22, none 3 |
| 0.45 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 91 / 160 | 123 | vocab 22, none 3 |
| 0.5 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 96 / 162 | 128 | vocab 22, none 3 |
| 0.6 | 25 | 60% | 84% | 64% | 4% | 16% | 12% | 115 / 181 | 146 | vocab 22, none 3 |

Picked: 0.5

### test-images, degraded conditions (centre aim): top-1 / wrong auto / broad / auto / blurry-gated / median sharpness / naming ms

| condition | plain | rot-margin | enhance |
|---|---|---|---|
| clean | 76% / 4% / 0% / 68% / 0% / 2942 / 92 | 76% / 4% / 0% / 68% / 0% / 2942 / 275 | 68% / 4% / 8% / 56% / 0% / 2942 / 106 |
| dark | 56% / 8% / 0% / 56% / 0% / 652 / 101 | 56% / 8% / 0% / 56% / 0% / 652 / 284 | 60% / 4% / 0% / 60% / 0% / 652 / 100 |
| very-dark | 28% / 0% / 8% / 20% / 0% / 957 / 108 | 24% / 4% / 12% / 28% / 0% / 957 / 307 | 36% / 0% / 4% / 28% / 0% / 957 / 113 |
| bright | 56% / 8% / 4% / 60% / 0% / 2660 / 92 | 60% / 12% / 0% / 68% / 0% / 2660 / 286 | 48% / 8% / 12% / 60% / 0% / 2660 / 102 |
| noisy | 60% / 4% / 4% / 56% / 0% / 7783 / 102 | 56% / 4% / 4% / 56% / 0% / 7783 / 289 | 56% / 4% / 8% / 60% / 0% / 7783 / 105 |
| blurry | 36% / 0% / 20% / 4% / 96% / 86 / 127 | 36% / 0% / 24% / 4% / 96% / 86 / 389 | 40% / 0% / 20% / 4% / 96% / 86 / 138 |
| close | 52% / 8% / 4% / 44% / 12% / 1200 / 101 | 44% / 12% / 8% / 48% / 12% / 1200 / 284 | 52% / 8% / 0% / 44% / 12% / 1200 / 112 |
| tilted | 72% / 4% / 0% / 60% / 0% / 2679 / 90 | 72% / 4% / 0% / 60% / 0% / 2679 / 272 | 72% / 4% / 0% / 56% / 0% / 2679 / 98 |
| dark-blurry | 16% / 4% / 4% / 8% / 0% / 339 / 118 | 16% / 4% / 4% / 12% / 0% / 339 / 342 | 16% / 0% / 8% / 12% / 0% / 339 / 123 |
| sideways | 52% / 8% / 4% / 56% / 0% / 2941 / 102 | 60% / 8% / 4% / 60% / 0% / 2941 / 270 | 56% / 8% / 8% / 60% / 0% / 2941 / 108 |
| upside-down | 48% / 16% / 4% / 56% / 0% / 2941 / 107 | 64% / 8% / 0% / 60% / 0% / 2941 / 276 | 48% / 8% / 8% / 44% / 0% / 2941 / 122 |
| mirrored | 72% / 4% / 4% / 64% / 0% / 2944 / 94 | 72% / 4% / 4% / 64% / 0% / 2944 / 289 | 68% / 4% / 4% / 68% / 0% / 2944 / 100 |

### test-images, personal objects (25 taught from augmented views)

Picked threshold 0.92, margin 0.04; full pipeline with it: matched 100%, false matches 0%, naming 42 ms

Own-object cosine: min 0.975, median 0.987. Best other-object cosine: max 0.904, median 0.844.

| image | own | closest other | cos |
|---|---|---|---|
| mug-01.jpg | 0.985 | held-mug-01.jpg | 0.747 |
| water-bottle-01.jpg | 0.986 | pill-bottle-01.jpg | 0.795 |
| glasses-01.jpg | 0.975 | ood-theremin-01.jpg | 0.868 |
| phone-01.jpg | 0.987 | held-phone-01.jpg | 0.834 |
| remote-01.jpg | 0.991 | spoon-01.jpg | 0.888 |
| toothbrush-01.jpg | 0.986 | cluttered-desk-mouse-01.jpg | 0.859 |
| pill-bottle-01.jpg | 0.984 | toothbrush-01.jpg | 0.844 |
| book-01.jpg | 0.977 | phone-01.jpg | 0.773 |
| spoon-01.jpg | 0.993 | remote-01.jpg | 0.901 |
| shoe-01.jpg | 0.988 | ood-sextant-01.jpg | 0.745 |
| keys-01.jpg | 0.993 | held-keys-01.jpg | 0.904 |
| chair-01.jpg | 0.994 | ood-theremin-01.jpg | 0.879 |
| banana-01.jpg | 0.989 | held-apple-01.jpg | 0.795 |
| cluttered-desk-cup-01.jpg | 0.993 | ood-theremin-01.jpg | 0.800 |
| cluttered-desk-laptop-01.jpg | 0.990 | cluttered-desk-monitor-01.jpg | 0.760 |
| cluttered-desk-mouse-01.jpg | 0.992 | cluttered-table-laptop-01.jpg | 0.775 |
| cluttered-table-laptop-01.jpg | 0.985 | cluttered-desk-monitor-01.jpg | 0.845 |
| cluttered-desk-monitor-01.jpg | 0.981 | phone-01.jpg | 0.811 |
| held-apple-01.jpg | 0.994 | cluttered-desk-mouse-01.jpg | 0.847 |
| held-phone-01.jpg | 0.982 | phone-01.jpg | 0.846 |
| held-mug-01.jpg | 0.984 | mug-01.jpg | 0.759 |
| held-keys-01.jpg | 0.986 | keys-01.jpg | 0.885 |
| ood-theremin-01.jpg | 0.987 | chair-01.jpg | 0.883 |
| ood-sextant-01.jpg | 0.989 | held-keys-01.jpg | 0.867 |
| ood-astrolabe-01.jpg | 0.991 | ood-theremin-01.jpg | 0.806 |

## wasm (2026-10-04, 1200 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 80% | 88% | 84% | 0% | 8% | 4% | 539 / 1282 | 587 | vocab 24, none 1 |
| single | 13 | 92% | 100% | 92% | 0% | 8% | 0% | 513 / 1287 | 569 | vocab 13 |
| cluttered | 5 | 80% | 100% | 100% | 0% | 20% | 0% | 578 / 1282 | 616 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 393 / 764 | 431 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 33% | 785 / 1038 | 826 | none 1, vocab 2 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | mug | 83% | auto | mug, travel mug, cup |
| water-bottle-01.jpg | water bottle | water bottle | 92% | auto | water bottle, cup, urinal bottle |
| glasses-01.jpg | glasses | glasses | 79% | auto | glasses, sunglasses, glasses case |
| phone-01.jpg | phone | phone | 60% | auto | phone, keyboard, calculator |
| remote-01.jpg | remote | remote | 95% | auto | remote, speaker, game controller |
| toothbrush-01.jpg | toothbrush | toothbrush | 64% | auto | toothbrush, toilet brush, toothpaste |
| pill-bottle-01.jpg | pills | pills | 43% | scanner | pills, pill bottle, pill organizer |
| book-01.jpg | book | book | 95% | auto | book, prayer book, e-reader |
| spoon-01.jpg | spoon | spoon | 91% | auto | spoon, oxygen tubing, weighted utensils |
| shoe-01.jpg | shoe | shoes | 64% | auto | shoes, sneakers, shoelaces |
| keys-01.jpg | keys | keys | 86% | auto | keys, padlock, can opener |
| chair-01.jpg | chair | furniture | 65% | auto | furniture, chair, table |
| banana-01.jpg | banana | banana | 94% | auto | banana, basket, fruit bowl |
| cluttered-desk-cup-01.jpg | cup | coffee | 49% | auto | coffee, hot chocolate, cup |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 74% | auto | laptop, tablet, computer |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 85% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | laptop | 45% | auto | laptop, keyboard, notebook |
| cluttered-desk-monitor-01.jpg | monitor | electronics | 63% | auto | electronics, monitor, sticky notes |
| held-apple-01.jpg | apple | apple | 93% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 82% | auto | phone, tablet, hand |
| held-mug-01.jpg | mug | mug | 61% | auto | mug, hot chocolate, cup |
| held-keys-01.jpg | keys | keys | 58% | auto | keys, padlock, remote |
| ood-theremin-01.jpg | theremin | (not sure) | 9% | scanner |  |
| ood-sextant-01.jpg | sextant | tape measure | 19% | scanner | tape measure, ruler, magnifying glass |
| ood-astrolabe-01.jpg | astrolabe | clock | 23% | scanner | clock, ruler, CD |

### test-images, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 84% | 88% | 92% | 4% | 4% | 0% | 458 / 861 | 498 | vocab 25 |
| single | 13 | 100% | 100% | 100% | 0% | 0% | 0% | 424 / 781 | 463 | vocab 13 |
| cluttered | 5 | 80% | 100% | 100% | 0% | 20% | 0% | 493 / 861 | 533 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 272 / 273 | 310 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 33% | 33% | 0% | 0% | 797 / 1061 | 838 | vocab 3 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | mug | 84% | auto | mug, travel mug, cup |
| water-bottle-01.jpg | water bottle | water bottle | 92% | auto | water bottle, cup, urinal bottle |
| glasses-01.jpg | glasses | glasses | 65% | auto | glasses, sunglasses, glasses case |
| phone-01.jpg | phone | phone | 58% | auto | phone, DVD, letter |
| remote-01.jpg | remote | remote | 95% | auto | remote, speaker, game controller |
| toothbrush-01.jpg | toothbrush | toothbrush | 78% | auto | toothbrush, toothpaste, dental floss |
| pill-bottle-01.jpg | pills | pill bottle | 57% | auto | pill bottle, baby food, pills |
| book-01.jpg | book | book | 93% | auto | book, prayer book, e-reader |
| spoon-01.jpg | spoon | spoon | 91% | auto | spoon, oxygen tubing, weighted utensils |
| shoe-01.jpg | shoe | shoes | 65% | auto | shoes, sneakers, shoelaces |
| keys-01.jpg | keys | keys | 90% | auto | keys, padlock, bottle opener |
| chair-01.jpg | chair | chair | 55% | auto | chair, stool, step stool |
| banana-01.jpg | banana | banana | 99% | auto | banana, fruit bowl, mango |
| cluttered-desk-cup-01.jpg | cup | drink | 67% | auto | drink, hot chocolate, coffee |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 74% | auto | laptop, tablet, computer |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 86% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | laptop | 68% | auto | laptop, keyboard, notebook |
| cluttered-desk-monitor-01.jpg | monitor | monitor | 78% | auto | monitor, computer, window |
| held-apple-01.jpg | apple | apple | 93% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 80% | auto | phone, tablet, watch |
| held-mug-01.jpg | mug | mug | 59% | auto | mug, cup, tea |
| held-keys-01.jpg | keys | keys | 51% | auto | keys, remote, can opener |
| ood-theremin-01.jpg | theremin | electronics | 67% | auto | electronics, radio, light switch |
| ood-sextant-01.jpg | sextant | tape measure | 15% | scanner | tape measure, ironing board, iron |
| ood-astrolabe-01.jpg | astrolabe | clock | 23% | scanner | clock, ruler, CD |

### test-images, confidence sweep (centre aim)

| threshold | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 25 | 84% | 84% | 96% | 12% | 0% | 4% | 368 / 787 | 407 | vocab 24, none 1 |
| 0.2 | 25 | 88% | 88% | 92% | 4% | 0% | 4% | 433 / 793 | 474 | vocab 24, none 1 |
| 0.25 | 25 | 84% | 88% | 88% | 0% | 4% | 4% | 467 / 1115 | 508 | vocab 24, none 1 |
| 0.3 | 25 | 84% | 88% | 88% | 0% | 4% | 4% | 462 / 1098 | 503 | vocab 24, none 1 |
| 0.35 | 25 | 84% | 88% | 84% | 0% | 4% | 4% | 496 / 1077 | 536 | vocab 24, none 1 |
| 0.4 | 25 | 84% | 88% | 84% | 0% | 4% | 4% | 488 / 1075 | 528 | vocab 24, none 1 |
| 0.45 | 25 | 80% | 88% | 84% | 0% | 8% | 4% | 546 / 1280 | 586 | vocab 24, none 1 |
| 0.5 | 25 | 76% | 88% | 84% | 4% | 8% | 4% | 583 / 1281 | 624 | vocab 24, none 1 |
| 0.6 | 25 | 72% | 88% | 84% | 0% | 16% | 4% | 615 / 1270 | 655 | vocab 24, none 1 |

Picked: 0.4

### test-images, degraded conditions (centre aim): top-1 / wrong auto / broad / auto / blurry-gated / median sharpness / naming ms

| condition | plain | rot-margin | enhance |
|---|---|---|---|
| clean | 80% / 0% / 8% / 84% / 0% / 2942 / 529 | 72% / 8% / 8% / 88% / 0% / 2942 / 1747 | 80% / 0% / 0% / 76% / 0% / 2942 / 546 |
| dark | 76% / 0% / 12% / 80% / 0% / 652 / 717 | 68% / 8% / 12% / 84% / 0% / 652 / 1750 | 64% / 12% / 12% / 84% / 0% / 652 / 496 |
| very-dark | 52% / 16% / 4% / 60% / 0% / 957 / 841 | 56% / 16% / 4% / 64% / 0% / 957 / 2231 | 52% / 12% / 8% / 68% / 0% / 957 / 608 |
| bright | 76% / 8% / 0% / 72% / 0% / 2660 / 728 | 76% / 8% / 0% / 76% / 0% / 2660 / 1929 | 72% / 8% / 4% / 76% / 0% / 2660 / 564 |
| noisy | 72% / 4% / 8% / 72% / 0% / 7783 / 685 | 64% / 12% / 12% / 84% / 0% / 7783 / 1826 | 68% / 8% / 12% / 76% / 0% / 7783 / 538 |
| blurry | 44% / 0% / 28% / 4% / 96% / 86 / 886 | 44% / 0% / 28% / 4% / 96% / 86 / 2397 | 36% / 0% / 32% / 4% / 96% / 86 / 704 |
| close | 52% / 12% / 12% / 64% / 12% / 1200 / 774 | 48% / 16% / 12% / 64% / 12% / 1200 / 2156 | 48% / 12% / 16% / 60% / 12% / 1200 / 629 |
| tilted | 80% / 4% / 4% / 84% / 0% / 2679 / 503 | 72% / 16% / 4% / 92% / 0% / 2679 / 1595 | 76% / 4% / 4% / 84% / 0% / 2679 / 496 |
| dark-blurry | 48% / 12% / 12% / 48% / 0% / 339 / 714 | 44% / 20% / 8% / 48% / 0% / 339 / 2422 | 56% / 8% / 8% / 56% / 0% / 339 / 754 |
| sideways | 72% / 4% / 4% / 72% / 0% / 2941 / 530 | 72% / 8% / 4% / 80% / 0% / 2941 / 1563 | 72% / 4% / 4% / 72% / 0% / 2941 / 517 |
| upside-down | 60% / 20% / 8% / 84% / 0% / 2941 / 517 | 68% / 16% / 8% / 92% / 0% / 2941 / 1644 | 64% / 20% / 4% / 80% / 0% / 2941 / 505 |
| mirrored | 80% / 4% / 4% / 88% / 0% / 2944 / 515 | 76% / 12% / 4% / 92% / 0% / 2944 / 1711 | 80% / 4% / 4% / 88% / 0% / 2944 / 540 |

### test-images, personal objects (25 taught from augmented views)

Picked threshold 0.92, margin 0.04; full pipeline with it: matched 100%, false matches 0%, naming 276 ms

Own-object cosine: min 0.944, median 0.978. Best other-object cosine: max 0.864, median 0.750.

| image | own | closest other | cos |
|---|---|---|---|
| mug-01.jpg | 0.984 | held-mug-01.jpg | 0.721 |
| water-bottle-01.jpg | 0.960 | held-mug-01.jpg | 0.604 |
| glasses-01.jpg | 0.965 | remote-01.jpg | 0.705 |
| phone-01.jpg | 0.967 | held-phone-01.jpg | 0.816 |
| remote-01.jpg | 0.981 | spoon-01.jpg | 0.826 |
| toothbrush-01.jpg | 0.982 | keys-01.jpg | 0.713 |
| pill-bottle-01.jpg | 0.960 | spoon-01.jpg | 0.666 |
| book-01.jpg | 0.969 | phone-01.jpg | 0.731 |
| spoon-01.jpg | 0.974 | remote-01.jpg | 0.824 |
| shoe-01.jpg | 0.980 | keys-01.jpg | 0.620 |
| keys-01.jpg | 0.979 | held-keys-01.jpg | 0.829 |
| chair-01.jpg | 0.983 | ood-theremin-01.jpg | 0.787 |
| banana-01.jpg | 0.984 | held-apple-01.jpg | 0.776 |
| cluttered-desk-cup-01.jpg | 0.981 | held-mug-01.jpg | 0.690 |
| cluttered-desk-laptop-01.jpg | 0.992 | held-phone-01.jpg | 0.798 |
| cluttered-desk-mouse-01.jpg | 0.990 | cluttered-table-laptop-01.jpg | 0.755 |
| cluttered-table-laptop-01.jpg | 0.964 | cluttered-desk-monitor-01.jpg | 0.750 |
| cluttered-desk-monitor-01.jpg | 0.967 | cluttered-table-laptop-01.jpg | 0.749 |
| held-apple-01.jpg | 0.986 | banana-01.jpg | 0.767 |
| held-phone-01.jpg | 0.965 | phone-01.jpg | 0.791 |
| held-mug-01.jpg | 0.967 | mug-01.jpg | 0.730 |
| held-keys-01.jpg | 0.981 | keys-01.jpg | 0.864 |
| ood-theremin-01.jpg | 0.944 | chair-01.jpg | 0.755 |
| ood-sextant-01.jpg | 0.962 | held-keys-01.jpg | 0.670 |
| ood-astrolabe-01.jpg | 0.978 | book-01.jpg | 0.715 |

## Thresholds picked across webgpu + wasm (confidence: mean over backends; personal: worst case)

- test-images: confidence threshold 0.45 (auto-commit 76%, wrong auto-commits 2%)
- test-images: personal threshold 0.92, margin 0.04 (matched 100%, false matches 0%)
