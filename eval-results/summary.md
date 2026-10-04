# Cue recognition eval

## webgpu (2026-10-04, 163 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 76% | 84% | 68% | 4% | 12% | 90 / 164 | 129 | vocab 22, none 3 |
| single | 13 | 92% | 92% | 77% | 0% | 8% | 85 / 131 | 130 | vocab 12, none 1 |
| cluttered | 5 | 60% | 100% | 60% | 20% | 0% | 96 / 178 | 128 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 76 / 111 | 106 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 67% | 121 / 164 | 153 | none 2, vocab 1 |

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
| held-mug-01.jpg | mug | mug | 45% | auto | mug, cup, coffee |
| held-keys-01.jpg | keys | keys | 66% | auto | keys, finger, hand |
| ood-theremin-01.jpg | theremin | (not sure) | 10% | scanner |  |
| ood-sextant-01.jpg | sextant | (not sure) | 9% | scanner |  |
| ood-astrolabe-01.jpg | astrolabe | drum | 34% | scanner | drum, CD, pie |

### test-images, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 80% | 80% | 76% | 0% | 8% | 88 / 127 | 120 | vocab 23, none 2 |
| single | 13 | 85% | 85% | 85% | 0% | 0% | 84 / 127 | 118 | vocab 13 |
| cluttered | 5 | 100% | 100% | 80% | 0% | 0% | 100 / 119 | 133 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 58 / 111 | 88 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 67% | 120 / 162 | 153 | none 2, vocab 1 |

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

| threshold | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 25 | 72% | 76% | 84% | 16% | 12% | 73 / 122 | 106 | vocab 22, none 3 |
| 0.2 | 25 | 72% | 80% | 80% | 12% | 12% | 78 / 158 | 111 | vocab 22, none 3 |
| 0.25 | 25 | 72% | 80% | 80% | 12% | 12% | 78 / 162 | 111 | vocab 22, none 3 |
| 0.3 | 25 | 76% | 84% | 80% | 8% | 12% | 81 / 158 | 113 | vocab 22, none 3 |
| 0.35 | 25 | 76% | 84% | 68% | 4% | 12% | 83 / 160 | 116 | vocab 22, none 3 |
| 0.4 | 25 | 76% | 84% | 68% | 4% | 12% | 88 / 156 | 121 | vocab 22, none 3 |
| 0.45 | 25 | 76% | 84% | 68% | 4% | 12% | 91 / 168 | 124 | vocab 22, none 3 |
| 0.5 | 25 | 76% | 84% | 68% | 4% | 12% | 96 / 159 | 128 | vocab 22, none 3 |
| 0.6 | 25 | 72% | 84% | 48% | 4% | 12% | 122 / 198 | 156 | vocab 22, none 3 |

Picked: 0.5

### test-images, degraded conditions (centre aim): top-1 / wrong auto / auto / naming ms

| condition | plain | enhance | enhance+flip |
|---|---|---|---|
| clean | 76% / 4% / 68% / 93 | 76% / 4% / 60% / 105 | 76% / 4% / 64% / 159 |
| dark | 56% / 8% / 60% / 98 | 60% / 4% / 60% / 109 | 64% / 4% / 60% / 168 |
| very-dark | 32% / 0% / 16% / 112 | 40% / 0% / 28% / 122 | 40% / 0% / 28% / 189 |
| bright | 60% / 8% / 56% / 113 | 60% / 8% / 60% / 99 | 60% / 8% / 64% / 156 |
| noisy | 64% / 4% / 56% / 105 | 60% / 4% / 60% / 112 | 60% / 4% / 56% / 164 |
| blurry | 56% / 4% / 40% / 149 | 56% / 4% / 44% / 136 | 60% / 0% / 48% / 214 |
| close | 56% / 4% / 44% / 153 | 52% / 4% / 40% / 118 | 56% / 8% / 44% / 169 |
| tilted | 72% / 4% / 64% / 88 | 72% / 4% / 64% / 94 | 68% / 4% / 64% / 146 |
| dark-blurry | 20% / 0% / 4% / 117 | 20% / 0% / 8% / 134 | 32% / 0% / 12% / 198 |

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

## wasm (2026-10-04, 729 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 88% | 88% | 80% | 0% | 4% | 472 / 1019 | 518 | vocab 24, none 1 |
| single | 13 | 100% | 100% | 92% | 0% | 0% | 430 / 792 | 482 | vocab 13 |
| cluttered | 5 | 100% | 100% | 80% | 0% | 0% | 571 / 1262 | 611 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 264 / 265 | 301 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 33% | 767 / 1019 | 805 | none 1, vocab 2 |

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
| chair-01.jpg | chair | chair | 41% | auto | chair, stool, high chair |
| banana-01.jpg | banana | banana | 94% | auto | banana, basket, fruit bowl |
| cluttered-desk-cup-01.jpg | cup | coffee | 49% | auto | coffee, hot chocolate, cup |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 74% | auto | laptop, tablet, computer |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 85% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | laptop | 45% | auto | laptop, keyboard, notebook |
| cluttered-desk-monitor-01.jpg | monitor | monitor | 31% | scanner | monitor, sticky notes, keyboard |
| held-apple-01.jpg | apple | apple | 93% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 82% | auto | phone, tablet, hand |
| held-mug-01.jpg | mug | mug | 41% | auto | mug, hot chocolate, cup |
| held-keys-01.jpg | keys | keys | 58% | auto | keys, padlock, remote |
| ood-theremin-01.jpg | theremin | (not sure) | 9% | scanner |  |
| ood-sextant-01.jpg | sextant | tape measure | 19% | scanner | tape measure, ruler, magnifying glass |
| ood-astrolabe-01.jpg | astrolabe | clock | 23% | scanner | clock, ruler, CD |

### test-images, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 84% | 88% | 88% | 4% | 0% | 442 / 760 | 480 | vocab 25 |
| single | 13 | 100% | 100% | 100% | 0% | 0% | 415 / 760 | 454 | vocab 13 |
| cluttered | 5 | 80% | 100% | 100% | 20% | 0% | 457 / 751 | 496 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 264 / 265 | 300 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 767 / 1020 | 808 | vocab 3 |

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
| cluttered-desk-cup-01.jpg | cup | hot chocolate | 42% | auto | hot chocolate, coffee, mug |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 74% | auto | laptop, tablet, computer |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 86% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | laptop | 68% | auto | laptop, keyboard, notebook |
| cluttered-desk-monitor-01.jpg | monitor | monitor | 78% | auto | monitor, computer, window |
| held-apple-01.jpg | apple | apple | 93% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 80% | auto | phone, tablet, watch |
| held-mug-01.jpg | mug | mug | 59% | auto | mug, cup, tea |
| held-keys-01.jpg | keys | keys | 51% | auto | keys, remote, can opener |
| ood-theremin-01.jpg | theremin | radio | 39% | scanner | radio, light switch, record player |
| ood-sextant-01.jpg | sextant | tape measure | 15% | scanner | tape measure, ironing board, iron |
| ood-astrolabe-01.jpg | astrolabe | clock | 23% | scanner | clock, ruler, CD |

### test-images, confidence sweep (centre aim)

| threshold | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 25 | 84% | 84% | 96% | 12% | 4% | 361 / 758 | 400 | vocab 24, none 1 |
| 0.2 | 25 | 88% | 88% | 92% | 4% | 4% | 429 / 800 | 468 | vocab 24, none 1 |
| 0.25 | 25 | 88% | 88% | 84% | 0% | 4% | 451 / 1015 | 489 | vocab 24, none 1 |
| 0.3 | 25 | 88% | 88% | 84% | 0% | 4% | 446 / 1045 | 485 | vocab 24, none 1 |
| 0.35 | 25 | 88% | 88% | 80% | 0% | 4% | 468 / 1027 | 506 | vocab 24, none 1 |
| 0.4 | 25 | 88% | 88% | 80% | 0% | 4% | 470 / 1059 | 509 | vocab 24, none 1 |
| 0.45 | 25 | 88% | 88% | 76% | 0% | 4% | 548 / 1307 | 588 | vocab 24, none 1 |
| 0.5 | 25 | 84% | 88% | 76% | 4% | 4% | 583 / 1284 | 623 | vocab 24, none 1 |
| 0.6 | 25 | 84% | 88% | 68% | 0% | 4% | 618 / 1272 | 658 | vocab 24, none 1 |

Picked: 0.3

### test-images, degraded conditions (centre aim): top-1 / wrong auto / auto / naming ms

| condition | plain | enhance | enhance+flip |
|---|---|---|---|
| clean | 88% / 0% / 80% / 486 | 80% / 4% / 80% / 512 | 84% / 4% / 84% / 902 |
| dark | 84% / 4% / 76% / 531 | 72% / 16% / 80% / 488 | 76% / 8% / 76% / 894 |
| very-dark | 56% / 8% / 44% / 611 | 56% / 12% / 64% / 597 | 60% / 4% / 60% / 1119 |
| bright | 76% / 8% / 76% / 543 | 72% / 8% / 76% / 534 | 72% / 12% / 80% / 988 |
| noisy | 76% / 4% / 80% / 515 | 72% / 8% / 80% / 510 | 72% / 8% / 76% / 993 |
| blurry | 68% / 20% / 72% / 662 | 64% / 12% / 72% / 680 | 68% / 12% / 72% / 1191 |
| close | 64% / 12% / 76% / 611 | 60% / 12% / 68% / 631 | 56% / 16% / 72% / 1100 |
| tilted | 84% / 4% / 84% / 445 | 80% / 4% / 80% / 455 | 80% / 4% / 80% / 856 |
| dark-blurry | 56% / 4% / 40% / 705 | 60% / 0% / 44% / 753 | 60% / 0% / 44% / 1342 |

### test-images, personal objects (25 taught from augmented views)

Picked threshold 0.92, margin 0.04; full pipeline with it: matched 100%, false matches 0%, naming 271 ms

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

- test-images: confidence threshold 0.4 (auto-commit 74%, wrong auto-commits 2%)
- test-images: personal threshold 0.92, margin 0.04 (matched 100%, false matches 0%)
