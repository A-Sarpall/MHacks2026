# Cue recognition eval

## webgpu (2026-10-04, 272 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 96 / 170 | 141 | vocab 22, none 3 |
| single | 13 | 92% | 92% | 77% | 0% | 0% | 8% | 88 / 134 | 142 | vocab 12, none 1 |
| cluttered | 5 | 60% | 100% | 60% | 20% | 0% | 0% | 102 / 186 | 136 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 96 / 116 | 129 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 67% | 125 / 170 | 159 | none 2, vocab 1 |

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
| all | 25 | 80% | 80% | 76% | 0% | 0% | 8% | 91 / 136 | 126 | vocab 23, none 2 |
| single | 13 | 85% | 85% | 85% | 0% | 0% | 0% | 88 / 136 | 125 | vocab 13 |
| cluttered | 5 | 100% | 100% | 80% | 0% | 0% | 0% | 104 / 124 | 138 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 59 / 114 | 91 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 67% | 123 / 160 | 157 | none 2, vocab 1 |

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
| 0.15 | 25 | 72% | 76% | 84% | 16% | 0% | 12% | 75 / 130 | 110 | vocab 22, none 3 |
| 0.2 | 25 | 72% | 80% | 80% | 12% | 0% | 12% | 81 / 172 | 116 | vocab 22, none 3 |
| 0.25 | 25 | 72% | 80% | 80% | 12% | 0% | 12% | 82 / 168 | 117 | vocab 22, none 3 |
| 0.3 | 25 | 76% | 84% | 80% | 8% | 0% | 12% | 83 / 163 | 118 | vocab 22, none 3 |
| 0.35 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 85 / 166 | 120 | vocab 22, none 3 |
| 0.4 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 91 / 167 | 126 | vocab 22, none 3 |
| 0.45 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 95 / 169 | 130 | vocab 22, none 3 |
| 0.5 | 25 | 76% | 84% | 68% | 4% | 0% | 12% | 97 / 166 | 131 | vocab 22, none 3 |
| 0.6 | 25 | 60% | 84% | 64% | 4% | 16% | 12% | 117 / 181 | 151 | vocab 22, none 3 |

Picked: 0.5

### test-images, degraded conditions (centre aim): top-1 / wrong auto / broad / auto / blurry-gated / re-oriented / median sharpness / naming ms / total ms

| condition | plain | upright-agree | rot-margin |
|---|---|---|---|
| clean | 76% / 4% / 0% / 68% / 0% / 0% / 2942 / 94 / 129 | 76% / 4% / 0% / 68% / 0% / 0% / 2942 / 94 / 256 | 76% / 4% / 0% / 68% / 0% / 0% / 2942 / 280 / 315 |
| dark | 56% / 8% / 0% / 56% / 0% / 0% / 652 / 100 / 134 | 56% / 8% / 0% / 56% / 0% / 0% / 652 / 101 / 248 | 56% / 8% / 0% / 56% / 0% / 0% / 652 / 289 / 323 |
| very-dark | 28% / 0% / 8% / 20% / 0% / 0% / 957 / 105 / 139 | 28% / 0% / 8% / 20% / 0% / 4% / 957 / 109 / 261 | 24% / 4% / 12% / 28% / 0% / 0% / 957 / 312 / 347 |
| bright | 56% / 8% / 4% / 60% / 0% / 0% / 2660 / 94 / 130 | 56% / 8% / 4% / 60% / 0% / 0% / 2660 / 94 / 239 | 60% / 12% / 0% / 68% / 0% / 0% / 2660 / 280 / 315 |
| noisy | 60% / 4% / 4% / 56% / 0% / 0% / 7783 / 99 / 133 | 60% / 4% / 4% / 56% / 0% / 0% / 7783 / 100 / 281 | 56% / 4% / 4% / 56% / 0% / 0% / 7783 / 286 / 320 |
| blurry | 36% / 0% / 20% / 4% / 96% / 0% / 86 / 130 / 166 | 36% / 0% / 20% / 4% / 96% / 0% / 86 / 129 / 287 | 36% / 0% / 24% / 4% / 96% / 0% / 86 / 389 / 424 |
| close | 52% / 8% / 4% / 44% / 12% / 0% / 1200 / 105 / 140 | 52% / 8% / 4% / 44% / 12% / 0% / 1200 / 105 / 249 | 44% / 12% / 8% / 48% / 12% / 0% / 1200 / 284 / 319 |
| tilted | 72% / 4% / 0% / 60% / 0% / 0% / 2679 / 92 / 127 | 72% / 4% / 0% / 60% / 0% / 0% / 2679 / 92 / 247 | 72% / 4% / 0% / 60% / 0% / 0% / 2679 / 271 / 306 |
| dark-blurry | 16% / 4% / 4% / 8% / 0% / 0% / 339 / 115 / 149 | 16% / 4% / 4% / 8% / 0% / 0% / 339 / 115 / 268 | 16% / 4% / 4% / 12% / 0% / 0% / 339 / 342 / 377 |
| sideways | 52% / 8% / 4% / 56% / 0% / 0% / 2941 / 101 / 136 | 56% / 8% / 4% / 64% / 0% / 32% / 2942 / 100 / 301 | 60% / 8% / 4% / 60% / 0% / 0% / 2941 / 271 / 305 |
| upside-down | 48% / 16% / 4% / 56% / 0% / 0% / 2941 / 109 / 145 | 56% / 16% / 0% / 64% / 0% / 32% / 2942 / 105 / 317 | 64% / 8% / 0% / 60% / 0% / 0% / 2941 / 275 / 310 |
| mirrored | 72% / 4% / 4% / 64% / 0% / 0% / 2944 / 96 / 132 | 72% / 4% / 4% / 64% / 0% / 4% / 2944 / 99 / 260 | 72% / 4% / 4% / 64% / 0% / 0% / 2944 / 289 / 323 |

### test-images, personal objects (25 taught from augmented views)

Picked threshold 0.92, margin 0.04; full pipeline with it: matched 100%, false matches 0%, naming 43 ms

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

## wasm (2026-10-04, 1273 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | broad | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 80% | 88% | 84% | 0% | 8% | 4% | 538 / 1282 | 586 | vocab 24, none 1 |
| single | 13 | 92% | 100% | 92% | 0% | 8% | 0% | 512 / 1285 | 567 | vocab 13 |
| cluttered | 5 | 80% | 100% | 100% | 0% | 20% | 0% | 577 / 1282 | 618 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 391 / 761 | 429 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 33% | 784 / 1039 | 824 | none 1, vocab 2 |

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
| all | 25 | 84% | 88% | 92% | 4% | 4% | 0% | 455 / 791 | 495 | vocab 25 |
| single | 13 | 100% | 100% | 100% | 0% | 0% | 0% | 425 / 779 | 465 | vocab 13 |
| cluttered | 5 | 80% | 100% | 100% | 0% | 20% | 0% | 475 / 781 | 516 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 0% | 270 / 271 | 308 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 33% | 33% | 0% | 0% | 798 / 1067 | 838 | vocab 3 |

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
| 0.15 | 25 | 84% | 84% | 96% | 12% | 0% | 4% | 364 / 781 | 404 | vocab 24, none 1 |
| 0.2 | 25 | 88% | 88% | 92% | 4% | 0% | 4% | 429 / 825 | 470 | vocab 24, none 1 |
| 0.25 | 25 | 84% | 88% | 88% | 0% | 4% | 4% | 460 / 1103 | 501 | vocab 24, none 1 |
| 0.3 | 25 | 84% | 88% | 88% | 0% | 4% | 4% | 458 / 1070 | 498 | vocab 24, none 1 |
| 0.35 | 25 | 84% | 88% | 84% | 0% | 4% | 4% | 486 / 1078 | 526 | vocab 24, none 1 |
| 0.4 | 25 | 84% | 88% | 84% | 0% | 4% | 4% | 487 / 1113 | 527 | vocab 24, none 1 |
| 0.45 | 25 | 80% | 88% | 84% | 0% | 8% | 4% | 536 / 1269 | 575 | vocab 24, none 1 |
| 0.5 | 25 | 76% | 88% | 84% | 4% | 8% | 4% | 586 / 1290 | 628 | vocab 24, none 1 |
| 0.6 | 25 | 72% | 88% | 84% | 0% | 16% | 4% | 620 / 1282 | 661 | vocab 24, none 1 |

Picked: 0.4

### test-images, degraded conditions (centre aim): top-1 / wrong auto / broad / auto / blurry-gated / re-oriented / median sharpness / naming ms / total ms

| condition | plain | upright-agree | rot-margin |
|---|---|---|---|
| clean | 80% / 0% / 8% / 84% / 0% / 0% / 2942 / 545 / 587 | 80% / 0% / 8% / 84% / 0% / 0% / 2942 / 540 / 807 | 72% / 8% / 8% / 88% / 0% / 0% / 2942 / 1824 / 1866 |
| dark | 76% / 0% / 12% / 80% / 0% / 0% / 652 / 559 / 599 | 76% / 0% / 12% / 80% / 0% / 0% / 652 / 559 / 746 | 68% / 8% / 12% / 84% / 0% / 0% / 652 / 1764 / 1806 |
| very-dark | 52% / 16% / 4% / 60% / 0% / 0% / 957 / 643 / 683 | 52% / 16% / 4% / 60% / 0% / 4% / 957 / 673 / 914 | 56% / 16% / 4% / 64% / 0% / 0% / 957 / 2377 / 2425 |
| bright | 76% / 8% / 0% / 72% / 0% / 0% / 2660 / 576 / 618 | 76% / 8% / 0% / 72% / 0% / 0% / 2660 / 580 / 729 | 76% / 8% / 0% / 76% / 0% / 0% / 2660 / 2120 / 2169 |
| noisy | 72% / 4% / 8% / 72% / 0% / 0% / 7783 / 553 / 594 | 72% / 4% / 8% / 72% / 0% / 0% / 7783 / 558 / 991 | 64% / 12% / 12% / 84% / 0% / 0% / 7783 / 1882 / 1925 |
| blurry | 44% / 0% / 28% / 4% / 96% / 0% / 86 / 716 / 758 | 44% / 0% / 28% / 4% / 96% / 0% / 86 / 722 / 952 | 44% / 0% / 28% / 4% / 96% / 0% / 86 / 2389 / 2435 |
| close | 52% / 12% / 12% / 64% / 12% / 0% / 1200 / 633 / 674 | 52% / 12% / 12% / 64% / 12% / 0% / 1200 / 641 / 789 | 48% / 16% / 12% / 64% / 12% / 0% / 1200 / 2209 / 2255 |
| tilted | 80% / 4% / 4% / 84% / 0% / 0% / 2679 / 497 / 539 | 80% / 4% / 4% / 84% / 0% / 0% / 2679 / 503 / 733 | 72% / 16% / 4% / 92% / 0% / 0% / 2679 / 1625 / 1667 |
| dark-blurry | 48% / 12% / 12% / 48% / 0% / 0% / 339 / 710 / 750 | 48% / 12% / 12% / 48% / 0% / 0% / 339 / 715 / 943 | 44% / 20% / 8% / 48% / 0% / 0% / 339 / 2434 / 2477 |
| sideways | 72% / 4% / 4% / 72% / 0% / 0% / 2941 / 531 / 572 | 80% / 0% / 8% / 80% / 0% / 12% / 2941 / 551 / 1105 | 72% / 8% / 4% / 80% / 0% / 0% / 2941 / 1581 / 1623 |
| upside-down | 60% / 20% / 8% / 84% / 0% / 0% / 2941 / 528 / 569 | 68% / 12% / 12% / 88% / 0% / 16% / 2941 / 546 / 1172 | 68% / 16% / 8% / 92% / 0% / 0% / 2941 / 1647 / 1690 |
| mirrored | 80% / 4% / 4% / 88% / 0% / 0% / 2944 / 527 / 568 | 80% / 4% / 4% / 88% / 0% / 0% / 2944 / 532 / 799 | 76% / 12% / 4% / 92% / 0% / 0% / 2944 / 1722 / 1765 |

### test-images, personal objects (25 taught from augmented views)

Picked threshold 0.92, margin 0.04; full pipeline with it: matched 100%, false matches 0%, naming 275 ms

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
