# test-images-public: sources, licences, selection and split

Public-image evaluation set for Qu's object identification pipeline, built from two
openly licensed datasets. Raw collector output stays under `raw/` (never deleted);
`dev/` and `heldout/` hold the merged, filtered and split copies plus a `labels.json`
each in the eval format (`src/vision/core/evalScore.ts`: `label`, `accept`, `aim`, `tags`).
`labels.json` at this level is the master list with a `split`, `source`, `sha1` and
`licence` field per file. `ATTRIBUTION.csv` lists every file with its origin and licence.

## Held-out rule

**`heldout/` must not be used, viewed or run through the eval until phase 3.** All
threshold tuning, prompt changes and vocabulary edits are done against `dev/` only.

## Datasets

| Source | Images kept | Licence | Citation |
| --- | --- | --- | --- |
| COCO 2017 val (`instances_val2017.json`, images fetched from `coco_url`) | 239 | Per-image Flickr licences: CC BY 2.0 (136), CC BY-SA 2.0 (66), CC BY-ND 2.0 (36), No known copyright restrictions (1); annotations CC BY 4.0. See `raw/coco/LICENCE.md`. | Lin et al., "Microsoft COCO: Common Objects in Context", ECCV 2014. |
| VizWiz-VQA train split (via Hugging Face mirror `Multimodal-Fatima/VizWiz_train`), photos taken by blind and low-vision users | 120 | CC BY 4.0 (https://vizwiz.org/tasks-and-datasets/vqa/). See `raw/vizwiz/LICENCE.md`. | Gurari et al., "VizWiz Grand Challenge: Answering Visual Questions from Blind People", CVPR 2018. |

Totals: 359 images, 106 vocabulary labels, dev 277 (coco 172, vizwiz 105), held-out 82 (coco 67, vizwiz 15).

Note on CC BY-ND: the 36 COCO crops under CC BY-ND 2.0 are derivatives of the originals.
They are kept for internal evaluation; filter `licence == "Attribution-NoDerivs License"`
in `labels.json` before any public redistribution.

## How images were selected and cropped

COCO: images with licence id in {4,5,6,7,8}; 46 COCO categories mapped to vocabulary
labels (bottle -> water bottle, cell phone -> phone, mouse -> computer mouse, couch -> sofa,
handbag -> purse, potted plant -> plant, refrigerator -> fridge, hair drier -> hair dryer,
others identical); annotations kept when iscrowd = 0, box area >= 12% of the image and
overlap with any other kept-category box <= 20% of the box; one annotation per image,
largest box first, at most 12 per label. Crop = box expanded 25% each side and clamped,
resized to longest side <= 1280, JPEG q88 (sharp). `aim` = box centre as a fraction of
the crop. Tag `cluttered` when another annotated object has >= 30% of its box inside the
crop, else `table` + `single`.

VizWiz: rows whose question is a "what is this / what is in this picture" pattern with no
attribute words; the 10 crowd answers normalised with the eval's matching rules and mapped
to a vocabulary label directly, through `PARENT_LABELS`, or through a small validated alias
table; at least 3 of 10 votes for the winning label; cap 8 per label. Images EXIF-rotated
and resized to longest side <= 1280, JPEG q88. `aim` = centre of the largest DETA detection
box (ratio >= 0.12) when available, else null (91 of 120). Tags `held`, `vizwiz`.

Merge (this directory): kept only entries whose `label` is an exact `VOCABULARY` label
(`src/data/vocabulary.ts`) and whose file decodes with Pillow; dropped duplicates by
source id and by file sha1 (none found); capped each label at 14 preferring the hand-held
VizWiz source (2 COCO files dropped: one dog, one umbrella). Spot check of 12 random files:
1 wrong/ambiguous (`umbrella-04.jpg`, an umbrella-shaped street sculpture), dropped; the
remaining 11 were correct. Each file's tags are the collector's tags plus the source name
and the vocabulary category of its label.

## Split rule

Stratified by label, deterministic: within each label sort files by sha1 of the file
bytes, and send every third file (index 2, 5, 8, ... zero-based) to `heldout/`; the rest
go to `dev/`. Labels with fewer than three images therefore appear only in `dev/`
(71 of 106 labels). The rule is reproducible from `labels.json` (`sha1` field).

## Known limitations

- Per-label counts are very uneven (1 to 14); 71 labels have one or two images.
- 182 of the COCO crops are tagged `cluttered`; COCO sources are at most 640 px so
  crops are small (short side median ~340 px, 25 files under 200 px).
- VizWiz labels come from crowd answers and were not individually reviewed beyond the
  12-file spot check; some are scene-like (hair, foot, finger, stairs, carpet, picture,
  paper, mailbox, door, stove, heater).
- Medication labels (pills, pill bottle, medicine: 1 file each) will fire the medication
  check. No out-of-vocabulary controls were added in this pass.
- Author names are not recorded by either source; `ATTRIBUTION.csv` gives the origin id
  and URL instead.
