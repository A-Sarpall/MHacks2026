# Cue recognition eval

## webgpu (2026-10-03, 44 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 76% | 84% | 64% | 4% | 12% | 89 / 166 | 128 | vocab 22, none 3 |
| single | 13 | 92% | 92% | 77% | 0% | 8% | 84 / 166 | 129 | vocab 12, none 1 |
| cluttered | 5 | 60% | 100% | 60% | 20% | 0% | 98 / 176 | 131 | vocab 5 |
| held | 4 | 100% | 100% | 75% | 0% | 0% | 75 / 111 | 104 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 67% | 118 / 158 | 150 | none 2, vocab 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | mug | 49% | auto | mug, cup, coffee |
| water-bottle-01.jpg | water bottle | water bottle | 13% | scanner | water bottle, glass, cup |
| glasses-01.jpg | glasses | glasses | 42% | auto | glasses, sunglasses, reading glasses |
| phone-01.jpg | phone | phone | 39% | auto | phone, ticket, remote |
| remote-01.jpg | remote | remote | 51% | auto | remote, donut, lighter |
| toothbrush-01.jpg | toothbrush | toothbrush | 35% | scanner | toothbrush, electric toothbrush, toothpaste |
| pill-bottle-01.jpg | pills | (not sure) | 12% | scanner |  |
| book-01.jpg | book | book | 41% | auto | book, prayer book, newspaper |
| spoon-01.jpg | spoon | spoon | 94% | auto | spoon, rope, spatula |
| shoe-01.jpg | shoe | sneakers | 40% | auto | sneakers, shoelaces, shoes |
| keys-01.jpg | keys | keys | 63% | auto | keys, key ring, padlock |
| chair-01.jpg | chair | chair | 37% | auto | chair, stool, armchair |
| banana-01.jpg | banana | banana | 79% | auto | banana, corn, lemon |
| cluttered-desk-cup-01.jpg | cup | mug | 31% | scanner | mug, cup, coffee |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 53% | auto | laptop, dice, monitor |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 57% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | keyboard | 55% | auto | keyboard, laptop, notebook |
| cluttered-desk-monitor-01.jpg | monitor | desk | 29% | scanner | desk, bill, monitor |
| held-apple-01.jpg | apple | apple | 85% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 46% | auto | phone, remote, finger |
| held-mug-01.jpg | mug | mug | 42% | auto | mug, cup, coffee |
| held-keys-01.jpg | keys | keys | 34% | scanner | keys, finger, key ring |
| ood-theremin-01.jpg | theremin | (not sure) | 10% | scanner |  |
| ood-sextant-01.jpg | sextant | (not sure) | 9% | scanner |  |
| ood-astrolabe-01.jpg | astrolabe | drum | 34% | scanner | drum, CD, pie |

### test-images, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 76% | 80% | 72% | 4% | 8% | 81 / 124 | 113 | vocab 23, none 2 |
| single | 13 | 85% | 85% | 85% | 0% | 0% | 77 / 124 | 110 | vocab 13 |
| cluttered | 5 | 80% | 100% | 80% | 20% | 0% | 83 / 114 | 115 | vocab 5 |
| held | 4 | 100% | 100% | 75% | 0% | 0% | 60 / 113 | 90 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 67% | 120 / 159 | 152 | none 2, vocab 1 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | mug | 62% | auto | mug, cup, coffee |
| water-bottle-01.jpg | water bottle | glass | 14% | scanner | glass, cup, ticket |
| glasses-01.jpg | glasses | glasses | 35% | auto | glasses, sunglasses, reading glasses |
| phone-01.jpg | phone | phone | 35% | auto | phone, ticket, pen |
| remote-01.jpg | remote | remote | 51% | auto | remote, donut, lighter |
| toothbrush-01.jpg | toothbrush | toothbrush | 53% | auto | toothbrush, comb, electric toothbrush |
| pill-bottle-01.jpg | pills | salt | 22% | scanner | salt, cup, jar |
| book-01.jpg | book | book | 46% | auto | book, prayer book, newspaper |
| spoon-01.jpg | spoon | spoon | 94% | auto | spoon, rope, spatula |
| shoe-01.jpg | shoe | sneakers | 50% | auto | sneakers, shoes, shoelaces |
| keys-01.jpg | keys | keys | 56% | auto | keys, key ring, padlock |
| chair-01.jpg | chair | chair | 42% | auto | chair, stool, armchair |
| banana-01.jpg | banana | banana | 99% | auto | banana, corn, lemon |
| cluttered-desk-cup-01.jpg | cup | mug | 31% | scanner | mug, cup, coffee |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 53% | auto | laptop, map, monitor |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 55% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | keyboard | 40% | auto | keyboard, laptop, notebook |
| cluttered-desk-monitor-01.jpg | monitor | monitor | 63% | auto | monitor, photo frame, tv |
| held-apple-01.jpg | apple | apple | 57% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 57% | auto | phone, remote, lime |
| held-mug-01.jpg | mug | cup | 49% | auto | cup, mug, drum |
| held-keys-01.jpg | keys | keys | 34% | scanner | keys, finger, key ring |
| ood-theremin-01.jpg | theremin | (not sure) | 8% | scanner |  |
| ood-sextant-01.jpg | sextant | (not sure) | 9% | scanner |  |
| ood-astrolabe-01.jpg | astrolabe | drum | 34% | scanner | drum, CD, pie |

### test-images, confidence sweep (centre aim)

| threshold | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 25 | 72% | 76% | 84% | 16% | 12% | 72 / 129 | 105 | vocab 22, none 3 |
| 0.2 | 25 | 72% | 80% | 80% | 12% | 12% | 77 / 157 | 109 | vocab 22, none 3 |
| 0.25 | 25 | 72% | 80% | 76% | 12% | 12% | 79 / 159 | 111 | vocab 22, none 3 |
| 0.3 | 25 | 76% | 84% | 76% | 8% | 12% | 82 / 158 | 114 | vocab 22, none 3 |
| 0.35 | 25 | 76% | 84% | 64% | 4% | 12% | 86 / 159 | 118 | vocab 22, none 3 |
| 0.4 | 25 | 76% | 84% | 60% | 4% | 12% | 90 / 177 | 122 | vocab 22, none 3 |
| 0.45 | 25 | 76% | 84% | 52% | 4% | 12% | 99 / 176 | 131 | vocab 22, none 3 |
| 0.5 | 25 | 76% | 84% | 48% | 4% | 12% | 107 / 175 | 139 | vocab 22, none 3 |
| 0.6 | 25 | 72% | 84% | 32% | 4% | 12% | 119 / 177 | 152 | vocab 22, none 3 |

Picked: 0.35

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

## wasm (2026-10-03, 211 s)

No labels.json in: test-images-public

### test-images, centre aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 80% | 88% | 80% | 8% | 4% | 497 / 1046 | 543 | vocab 24, none 1 |
| single | 13 | 85% | 100% | 92% | 15% | 0% | 432 / 802 | 486 | vocab 13 |
| cluttered | 5 | 100% | 100% | 80% | 0% | 0% | 565 / 1258 | 604 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 405 / 819 | 443 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 33% | 785 / 1046 | 826 | none 1, vocab 2 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | travel mug | 43% | auto | travel mug, mug, coffee |
| water-bottle-01.jpg | water bottle | water bottle | 92% | auto | water bottle, sippy cup, urinal bottle |
| glasses-01.jpg | glasses | glasses | 59% | auto | glasses, reading glasses, sunglasses |
| phone-01.jpg | phone | phone | 60% | auto | phone, keyboard, calculator |
| remote-01.jpg | remote | remote | 95% | auto | remote, magnifying glass, game controller |
| toothbrush-01.jpg | toothbrush | toothbrush | 46% | auto | toothbrush, electric toothbrush, toilet brush |
| pill-bottle-01.jpg | pills | pills | 43% | scanner | pills, pill bottle, pill organizer |
| book-01.jpg | book | prayer book | 90% | auto | prayer book, book, e-reader |
| spoon-01.jpg | spoon | spoon | 91% | auto | spoon, oxygen tubing, weighted utensils |
| shoe-01.jpg | shoe | sneakers | 44% | auto | sneakers, shoes, shoelaces |
| keys-01.jpg | keys | keys | 64% | auto | keys, key ring, padlock |
| chair-01.jpg | chair | chair | 36% | auto | chair, stool, armchair |
| banana-01.jpg | banana | banana | 94% | auto | banana, basket, fruit bowl |
| cluttered-desk-cup-01.jpg | cup | coffee | 49% | auto | coffee, hot chocolate, cup |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 74% | auto | laptop, tablet, computer |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 85% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | laptop | 45% | auto | laptop, keyboard, notebook |
| cluttered-desk-monitor-01.jpg | monitor | monitor | 31% | scanner | monitor, sticky notes, keyboard |
| held-apple-01.jpg | apple | apple | 93% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 81% | auto | phone, tablet, hand |
| held-mug-01.jpg | mug | mug | 53% | auto | mug, hot chocolate, travel mug |
| held-keys-01.jpg | keys | keys | 42% | auto | keys, key ring, padlock |
| ood-theremin-01.jpg | theremin | (not sure) | 9% | scanner |  |
| ood-sextant-01.jpg | sextant | tape measure | 19% | scanner | tape measure, ruler, magnifying glass |
| ood-astrolabe-01.jpg | astrolabe | clock | 22% | scanner | clock, ruler, CD |

### test-images, labelled aim

| | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| all | 25 | 76% | 88% | 88% | 12% | 0% | 432 / 794 | 472 | vocab 25 |
| single | 13 | 77% | 100% | 100% | 23% | 0% | 387 / 794 | 428 | vocab 13 |
| cluttered | 5 | 100% | 100% | 100% | 0% | 0% | 368 / 758 | 408 | vocab 5 |
| held | 4 | 100% | 100% | 100% | 0% | 0% | 395 / 770 | 434 | vocab 4 |
| out-of-vocab | 3 | 0% | 0% | 0% | 0% | 0% | 786 / 1043 | 826 | vocab 3 |

| image | expected | answer | score | | choices |
|---|---|---|---|---|---|
| mug-01.jpg | mug | travel mug | 69% | auto | travel mug, mug, coffee |
| water-bottle-01.jpg | water bottle | water bottle | 92% | auto | water bottle, sippy cup, urinal bottle |
| glasses-01.jpg | glasses | glasses | 54% | auto | glasses, sunglasses, reading glasses |
| phone-01.jpg | phone | phone | 57% | auto | phone, DVD, letter |
| remote-01.jpg | remote | remote | 95% | auto | remote, smart speaker, game controller |
| toothbrush-01.jpg | toothbrush | toothbrush | 69% | auto | toothbrush, toothpaste, electric toothbrush |
| pill-bottle-01.jpg | pills | baby food | 35% | auto | baby food, pill bottle, peanut butter |
| book-01.jpg | book | prayer book | 85% | auto | prayer book, book, e-reader |
| spoon-01.jpg | spoon | spoon | 91% | auto | spoon, oxygen tubing, weighted utensils |
| shoe-01.jpg | shoe | sneakers | 40% | auto | sneakers, shoes, shoelaces |
| keys-01.jpg | keys | keys | 69% | auto | keys, key ring, padlock |
| chair-01.jpg | chair | chair | 46% | auto | chair, stool, armchair |
| banana-01.jpg | banana | banana | 99% | auto | banana, fruit bowl, mango |
| cluttered-desk-cup-01.jpg | cup | coffee | 36% | auto | coffee, hot chocolate, tea |
| cluttered-desk-laptop-01.jpg | laptop | laptop | 74% | auto | laptop, tablet, computer |
| cluttered-desk-mouse-01.jpg | mouse | computer mouse | 86% | auto | computer mouse, keyboard, placemat |
| cluttered-table-laptop-01.jpg | laptop | laptop | 68% | auto | laptop, keyboard, notebook |
| cluttered-desk-monitor-01.jpg | monitor | monitor | 78% | auto | monitor, computer, window |
| held-apple-01.jpg | apple | apple | 93% | auto | apple, peach, orange |
| held-phone-01.jpg | phone | phone | 79% | auto | phone, tablet, hand |
| held-mug-01.jpg | mug | mug | 44% | auto | mug, travel mug, cup |
| held-keys-01.jpg | keys | keys | 75% | auto | keys, key ring, hand |
| ood-theremin-01.jpg | theremin | radio | 39% | scanner | radio, light switch, record player |
| ood-sextant-01.jpg | sextant | tape measure | 15% | scanner | tape measure, ironing board, iron |
| ood-astrolabe-01.jpg | astrolabe | clock | 22% | scanner | clock, ruler, CD |

### test-images, confidence sweep (centre aim)

| threshold | n | top-1 | top-3 | auto | wrong auto | not sure | naming ms avg/p95 | total ms | answered by |
|---|---|---|---|---|---|---|---|---|---|
| 0.15 | 25 | 76% | 84% | 96% | 20% | 4% | 361 / 767 | 401 | vocab 24, none 1 |
| 0.2 | 25 | 80% | 88% | 92% | 12% | 4% | 418 / 762 | 457 | vocab 24, none 1 |
| 0.25 | 25 | 80% | 88% | 84% | 8% | 4% | 447 / 1039 | 487 | vocab 24, none 1 |
| 0.3 | 25 | 80% | 88% | 84% | 8% | 4% | 453 / 1051 | 493 | vocab 24, none 1 |
| 0.35 | 25 | 80% | 88% | 80% | 8% | 4% | 490 / 1015 | 529 | vocab 24, none 1 |
| 0.4 | 25 | 80% | 88% | 76% | 8% | 4% | 525 / 1243 | 565 | vocab 24, none 1 |
| 0.45 | 25 | 80% | 88% | 72% | 8% | 4% | 582 / 1265 | 622 | vocab 24, none 1 |
| 0.5 | 25 | 76% | 88% | 68% | 12% | 4% | 643 / 1246 | 682 | vocab 24, none 1 |
| 0.6 | 25 | 76% | 88% | 52% | 8% | 4% | 705 / 1268 | 746 | vocab 24, none 1 |

Picked: 0.3

### test-images, personal objects (25 taught from augmented views)

Picked threshold 0.92, margin 0.04; full pipeline with it: matched 100%, false matches 0%, naming 268 ms

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

- test-images: confidence threshold 0.35 (auto-commit 72%, wrong auto-commits 6%)
- test-images: personal threshold 0.92, margin 0.04 (matched 100%, false matches 0%)
