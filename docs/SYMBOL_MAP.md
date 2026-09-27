# SYMBOL_MAP — Tiem Mi Cay

Registry cua tat ca symbol minified trong game.js.
Cap nhat moi khi rename, extract, hoac phan loai them.

## Trang thai ky hieu

| Ky hieu    | Mo ta            |
|------------|------------------|
| pending    | chua phan tich   |
| classified | da biet domain   |
| understood | co pseudo-code   |
| candidate  | co ten de xuat   |
| renamed    | da doi ten       |
| extracted  | da tach module   |

---

## Global objects (Wave 1 + Wave 2)

| Old | Proposed         | Type   | Domain | Evidence                        | Confidence | Status  |
|-----|------------------|--------|--------|---------------------------------|------------|---------|
| kA  | imageAssets      | object | assets | Bang WEBP data URI, kA.shop     | HIGH       | aliased |
| y   | itemCatalog      | object | config | y[id].cost, y[id].type, y[id].sell | HIGH    | aliased |
| $A  | allItemIds       | array  | config | Array of all item id strings    | HIGH       | aliased |
| uA  | brothItemIds     | array  | config | Filtered type=broth             | HIGH       | aliased |
| xA  | toppingItemIds   | array  | config | Filtered type=topping           | HIGH       | aliased |
| o   | gameState        | object | state  | Persistent save state           | HIGH       | aliased |
| i   | runtimeState     | object | state  | Session state (mode,tab,pots…)  | HIGH       | aliased |

---

## Persistence subsystem (Wave 1)

| Old | Proposed                | Type     | Side effects          | Confidence | Status  |
|-----|-------------------------|----------|-----------------------|------------|---------|
| Wn  | createDefaultSaveState  | function | none                  | HIGH       | aliased |
| bt  | normalizeSaveState      | function | updates o fields      | HIGH       | aliased |
| Hc  | loadSaveState           | function | sets o                | HIGH       | aliased |
| Q   | saveGameState           | function | writes localStorage   | HIGH       | aliased |
| Dc  | encodeSaveEnvelope      | function | none                  | HIGH       | aliased |
| Li  | decodeSaveEnvelope      | function | none                  | HIGH       | aliased |

---

## Inventory subsystem (Wave 3)

| Old | Proposed              | Type     | Side effects            | Confidence | Status  |
|-----|-----------------------|----------|-------------------------|------------|---------|
| Bt  | addInventoryBatch     | function | modifies o.inv          | HIGH       | aliased |
| FA  | consumeInventoryItem  | function | modifies o.inv          | HIGH       | aliased |
| xc  | removeExpiredStock    | function | modifies o.inv, o.stats | HIGH       | aliased |

---

## UI da phan tich mot phan

| Old | Proposed               | Confidence | Status            |
|-----|------------------------|------------|-------------------|
| Ra  | renderSplashScreen     | HIGH       | candidate         |
| Ya  | showAnnouncementModal  | HIGH       | renamed (removed) |
| Ms  | hasSeenAnnouncement    | HIGH       | candidate         |
| ti  | openOnboardingDialog   | HIGH       | candidate         |
| Ds  | buildOnboardingSlides  | HIGH       | candidate         |
| ni  | showTermsModal         | HIGH       | candidate         |
| Ps  | renderTermsReadonly    | MEDIUM     | aliased           |
| k   | showToast              | MEDIUM     | aliased           |
| E   | showModal              | MEDIUM     | aliased           |
| M   | playSound              | MEDIUM     | aliased           |
| dA  | renderMascot           | MEDIUM     | aliased           |
| zA  | renderSettingsScreen   | MEDIUM     | aliased           |
| TA  | startPrepMode          | MEDIUM     | aliased           |
| Rt  | resetGameStateKeepSettings | MEDIUM | aliased           |

---

## 251 function declarations (sorted by line)

| # | Symbol | Line  | Domain  | Candidate              | Conf   |
|--:|--------|------:|---------|------------------------|--------|
|  1| pc     |  1092 | unknown | -                      | LOW    |
|  2| mt     |  1157 | unknown | -                      | LOW    |
|  3| yc     |  1194 | unknown | -                      | LOW    |
|  4| Bc     |  1200 | unknown | -                      | LOW    |
|  5| Si     |  1205 | unknown | -                      | LOW    |
|  6| kc     |  1266 | unknown | -                      | LOW    |
|  7| ul     |  1273 | unknown | -                      | LOW    |
|  8| Li     |  1302 | persistence | decodeSaveEnvelope  | HIGH   |
|  9| Wn     |  1355 | persistence | createDefaultSaveState | HIGH |
| 10| Wi     |  1439 | unknown | -                      | LOW    |
| 11| Cc     |  1464 | unknown | -                      | LOW    |
| 12| bt     |  1494 | persistence | normalizeSaveState  | HIGH   |
| 13| qc     |  1731 | unknown | -                      | LOW    |
| 14| yt     |  1750 | unknown | -                      | LOW    |
| 15| Hc     |  1778 | persistence | loadSaveState       | HIGH   |
| 16| Bt     |  1837 | inventory | addInventoryBatch     | HIGH   |
| 17| FA     |  1852 | inventory | consumeInventoryItem  | HIGH   |
| 18| xc     |  1862 | inventory | removeExpiredStock    | HIGH   |
| 19| Pe     |  1891 | unknown | -                      | LOW    |
| 20| Kn     |  1914 | unknown | -                      | LOW    |
| 21| Te     |  1943 | unknown | -                      | LOW    |
| 22| jc     |  1960 | unknown | -                      | LOW    |
| 23| ca     |  1964 | unknown | -                      | LOW    |
| 24| Ct     |  1985 | unknown | -                      | LOW    |
| 25| Xc     |  2008 | unknown | -                      | LOW    |
| 26| Nc     |  2016 | unknown | -                      | LOW    |
| 27| mn     |  2034 | unknown | -                      | LOW    |
| 28| Ic     |  2041 | unknown | -                      | LOW    |
| 29| la     |  2053 | unknown | -                      | LOW    |
| 30| EA     |  2059 | unknown | -                      | LOW    |
| 31| pA     |  2071 | unknown | -                      | LOW    |
| 32| dA     |  2084 | ui      | renderMascot           | MEDIUM |
| 33| ze     |  2087 | unknown | -                      | LOW    |
| 34| qt     |  2095 | unknown | -                      | LOW    |
| 35| xt     |  2144 | unknown | -                      | LOW    |
| 36| ga     |  2147 | unknown | -                      | LOW    |
| 37| Qt     |  2151 | unknown | -                      | LOW    |
| 38| Wc     |  2159 | unknown | -                      | LOW    |
| 39| da     |  2172 | unknown | -                      | LOW    |
| 40| ma     |  2176 | unknown | -                      | LOW    |
| 41| Un     |  2181 | unknown | -                      | LOW    |
| 42| Gc     |  2189 | unknown | -                      | LOW    |
| 43| En     |  2212 | unknown | -                      | LOW    |
| 44| Fe     |  2232 | unknown | -                      | LOW    |
| 45| Kc     |  2238 | unknown | -                      | LOW    |
| 46| tA     |  2256 | unknown | -                      | LOW    |
| 47| Jn     |  2272 | unknown | -                      | LOW    |
| 48| M      |  2291 | audio   | playSound              | MEDIUM |
| 49| Jc     |  2296 | unknown | -                      | LOW    |
| 50| ba     |  2376 | unknown | -                      | LOW    |
| 51| Ue     |  2379 | unknown | -                      | LOW    |
| 52| As     |  2476 | unknown | -                      | LOW    |
| 53| ns     |  2508 | unknown | -                      | LOW    |
| 54| Et     |  2521 | unknown | -                      | LOW    |
| 55| jt     |  2526 | unknown | -                      | LOW    |
| 56| Ie     |  2586 | unknown | -                      | LOW    |
| 57| ya     |  2601 | unknown | -                      | LOW    |
| 58| Ba     |  2605 | unknown | -                      | LOW    |
| 59| wa     |  2608 | unknown | -                      | LOW    |
| 60| Xt     |  2615 | unknown | -                      | LOW    |
| 61| ts     |  2627 | unknown | -                      | LOW    |
| 62| es     |  2645 | unknown | -                      | LOW    |
| 63| is     |  2656 | unknown | -                      | LOW    |
| 64| Se     |  2678 | unknown | -                      | LOW    |
| 65| Ye     |  2700 | unknown | -                      | LOW    |
| 66| qA     |  2716 | unknown | -                      | LOW    |
| 67| ka     |  2744 | unknown | -                      | LOW    |
| 68| k      |  2753 | ui      | showToast              | MEDIUM |
| 69| E      |  2760 | ui      | showModal              | MEDIUM |
| 70| Ze     |  2790 | unknown | -                      | LOW    |
| 71| _n     |  2806 | unknown | -                      | LOW    |
| 72| At     |  2821 | unknown | -                      | LOW    |
| 73| cs     |  2833 | unknown | -                      | LOW    |
| 74| vn     |  2918 | unknown | -                      | LOW    |
| 75| Da     |  2949 | unknown | -                      | LOW    |
| 76| YA     |  2971 | unknown | -                      | LOW    |
| 77| hA     |  3001 | unknown | -                      | LOW    |
| 78| tn     |  3029 | unknown | -                      | LOW    |
| 79| RA     |  3051 | unknown | -                      | LOW    |
| 80| WA     |  3074 | unknown | -                      | LOW    |
| 81| Xn     |  3102 | unknown | -                      | LOW    |
| 82| en     |  3167 | unknown | -                      | LOW    |
| 83| Oe     |  3184 | unknown | -                      | LOW    |
| 84| Ca     |  3196 | unknown | -                      | LOW    |
| 85| hs     |  3222 | unknown | -                      | LOW    |
| 86| ls     |  3229 | unknown | -                      | LOW    |
| 87| qa     |  3398 | unknown | -                      | LOW    |
| 88| rs     |  3403 | unknown | -                      | LOW    |
| 89| Ha     |  3445 | unknown | -                      | LOW    |
| 90| us     |  3465 | unknown | -                      | LOW    |
| 91| It     |  3486 | unknown | -                      | LOW    |
| 92| tt     |  3513 | unknown | -                      | LOW    |
| 93| an     |  3525 | unknown | -                      | LOW    |
| 94| Ge     |  3552 | unknown | -                      | LOW    |
| 95| Ke     |  3567 | unknown | -                      | LOW    |
| 96| Je     |  3600 | unknown | -                      | LOW    |
| 97| Qa     |  3617 | unknown | -                      | LOW    |
| 98| _e     |  3638 | unknown | -                      | LOW    |
| 99| za     |  3677 | unknown | -                      | LOW    |
|100| it     |  3702 | unknown | -                      | LOW    |
|101| ps     |  3709 | unknown | -                      | LOW    |
|102| Ua     |  3718 | unknown | -                      | LOW    |
|103| vs     |  3721 | unknown | -                      | LOW    |
|104| bs     |  3732 | unknown | -                      | LOW    |
|105| ys     |  3763 | unknown | -                      | LOW    |
|106| Bs     |  3776 | unknown | -                      | LOW    |
|107| ws     |  3795 | unknown | -                      | LOW    |
|108| ks     |  3829 | unknown | -                      | LOW    |
|109| Ms     |  3892 | ui/modal | hasSeenAnnouncement   | HIGH   |
|110| Ya     |  3901 | ui/modal | showAnnouncementModal (REMOVED) | HIGH |
|111| Ra     |  3904 | ui/screen | renderSplashScreen   | HIGH   |
|112| ni     |  3952 | ui/modal | showTermsModal        | HIGH   |
|113| Ps     |  3972 | ui      | renderTermsReadonly    | MEDIUM |
|114| Ds     |  3975 | ui      | buildOnboardingSlides  | HIGH   |
|115| ti     |  3980 | ui/modal | openOnboardingDialog  | HIGH   |
|116| Rt     |  4062 | state   | resetGameStateKeepSettings | MEDIUM |
|117| TA     |  4073 | app     | startPrepMode          | MEDIUM |
|118| ZA     |  4099 | unknown | -                      | LOW    |
|119| Oa     |  4194 | unknown | -                      | LOW    |
|120| gA     |  4204 | unknown | -                      | LOW    |
|121| Zt     |  4231 | unknown | -                      | LOW    |
|122| xs     |  4235 | unknown | -                      | LOW    |
|123| Ts     |  4259 | unknown | -                      | LOW    |
|124| zs     |  4262 | unknown | -                      | LOW    |
|125| Ga     |  4360 | unknown | -                      | LOW    |
|126| Ka     |  4369 | unknown | -                      | LOW    |
|127| Vs     |  4399 | unknown | -                      | LOW    |
|128| Ot     |  4408 | unknown | -                      | LOW    |
|129| ai     |  4457 | unknown | -                      | LOW    |
|130| Fs     |  4469 | unknown | -                      | LOW    |
|131| Us     |  4474 | unknown | -                      | LOW    |
|132| Es     |  4503 | unknown | -                      | LOW    |
|133| yn     |  4507 | unknown | -                      | LOW    |
|134| js     |  4525 | unknown | -                      | LOW    |
|135| Xs     |  4544 | unknown | -                      | LOW    |
|136| Ns     |  4575 | unknown | -                      | LOW    |
|137| Is     |  4617 | unknown | -                      | LOW    |
|138| Ss     |  4665 | unknown | -                      | LOW    |
|139| io     |  4734 | unknown | -                      | LOW    |
|140| Rs     |  4757 | unknown | -                      | LOW    |
|141| Zs     |  4785 | unknown | -                      | LOW    |
|142| Ls     |  4795 | unknown | -                      | LOW    |
|143| oo     |  4833 | unknown | -                      | LOW    |
|144| Os     |  4870 | unknown | -                      | LOW    |
|145| Ws     |  4881 | unknown | -                      | LOW    |
|146| Gs     |  4898 | unknown | -                      | LOW    |
|147| so     |  4918 | unknown | -                      | LOW    |
|148| zA     |  4940 | ui/screen | renderSettingsScreen | MEDIUM |
|149| Ks     |  5021 | unknown | -                      | LOW    |
|150| ho     |  5226 | unknown | -                      | LOW    |
|151| ct     |  5266 | unknown | -                      | LOW    |
|152| _t     |  5277 | unknown | -                      | LOW    |
|153| wA     |  5358 | unknown | -                      | LOW    |
|154| _s     |  5362 | unknown | -                      | LOW    |
|155| In     |  5401 | unknown | -                      | LOW    |
|156| cn     |  5413 | unknown | -                      | LOW    |
|157| si     |  5417 | unknown | -                      | LOW    |
|158| Ah     |  5453 | unknown | -                      | LOW    |
|159| PA     |  5462 | unknown | -                      | LOW    |
|160| Sn     |  5501 | unknown | -                      | LOW    |
|161| th     |  5541 | unknown | -                      | LOW    |
|162| eh     |  5560 | unknown | -                      | LOW    |
|163| ih     |  5570 | unknown | -                      | LOW    |
|164| AA     |  5592 | unknown | -                      | LOW    |
|165| go     |  5621 | unknown | -                      | LOW    |
|166| Yn     |  5635 | unknown | -                      | LOW    |
|167| Rn     |  5649 | unknown | -                      | LOW    |
|168| fo     |  5672 | unknown | -                      | LOW    |
|169| ah     |  5691 | unknown | -                      | LOW    |
|170| oh     |  5705 | unknown | -                      | LOW    |
|171| Mn     |  5733 | unknown | -                      | LOW    |
|172| XA     |  5755 | unknown | -                      | LOW    |
|173| sh     |  5781 | unknown | -                      | LOW    |
|174| eA     |  5893 | unknown | -                      | LOW    |
|175| mo     |  5898 | unknown | -                      | LOW    |
|176| hh     |  5906 | unknown | -                      | LOW    |
|177| vo     |  6024 | unknown | -                      | LOW    |
|178| lh     |  6109 | unknown | -                      | LOW    |
|179| rh     |  6141 | unknown | -                      | LOW    |
|180| vA     |  6169 | unknown | -                      | LOW    |
|181| uh     |  6188 | unknown | -                      | LOW    |
|182| gh     |  6212 | unknown | -                      | LOW    |
|183| fh     |  6235 | unknown | -                      | LOW    |
|184| bo     |  6308 | unknown | -                      | LOW    |
|185| Bo     |  6402 | unknown | -                      | LOW    |
|186| dh     |  6443 | unknown | -                      | LOW    |
|187| GA     |  6458 | unknown | -                      | LOW    |
|188| ui     |  6518 | unknown | -                      | LOW    |
|189| mh     |  6694 | unknown | -                      | LOW    |
|190| Ae     |  6727 | unknown | -                      | LOW    |
|191| wo     |  6785 | unknown | -                      | LOW    |
|192| HA     |  6808 | unknown | -                      | LOW    |
|193| ph     |  6824 | unknown | -                      | LOW    |
|194| Mo     |  6838 | unknown | -                      | LOW    |
|195| fi     |  6873 | unknown | -                      | LOW    |
|196| yh     |  6881 | unknown | -                      | LOW    |
|197| N      |  6933 | unknown | -                      | LOW    |
|198| KA     |  6940 | unknown | -                      | LOW    |
|199| di     |  6952 | unknown | -                      | LOW    |
|200| ne     |  6976 | unknown | -                      | LOW    |
|201| sn     |  6987 | unknown | -                      | LOW    |
|202| aA     |  6991 | unknown | -                      | LOW    |
|203| hn     |  7007 | unknown | -                      | LOW    |
|204| te     |  7029 | unknown | -                      | LOW    |
|205| Do     |  7039 | unknown | -                      | LOW    |
|206| Co     |  7049 | unknown | -                      | LOW    |
|207| kh     |  7939 | unknown | -                      | LOW    |
|208| pi     |  8026 | unknown | -                      | LOW    |
|209| Mh     |  8039 | unknown | -                      | LOW    |
|210| Ph     |  8091 | unknown | -                      | LOW    |
|211| To     |  8119 | unknown | -                      | LOW    |
|212| zo     |  8129 | unknown | -                      | LOW    |
|213| ln     |  8179 | unknown | -                      | LOW    |
|214| Vo     |  8216 | unknown | -                      | LOW    |
|215| qh     |  8250 | unknown | -                      | LOW    |
|216| bi     |  8272 | unknown | -                      | LOW    |
|217| Hh     |  8365 | unknown | -                      | LOW    |
|218| xh     |  8399 | unknown | -                      | LOW    |
|219| Qh     |  8427 | unknown | -                      | LOW    |
|220| Th     |  8447 | unknown | -                      | LOW    |
|221| zh     |  8495 | unknown | -                      | LOW    |
|222| Vh     |  8501 | unknown | -                      | LOW    |
|223| yi     |  8506 | unknown | -                      | LOW    |
|224| Eo     |  8516 | unknown | -                      | LOW    |
|225| Fh     |  8546 | unknown | -                      | LOW    |
|226| Uh     |  8573 | unknown | -                      | LOW    |
|227| oe     |  8597 | unknown | -                      | LOW    |
|228| wi     |  8684 | unknown | -                      | LOW    |
|229| ce     |  8759 | unknown | -                      | LOW    |
|230| Eh     |  8766 | unknown | -                      | LOW    |
|231| Yo     |  8792 | unknown | -                      | LOW    |
|232| jh     |  8808 | unknown | -                      | LOW    |
|233| Xh     |  8837 | unknown | -                      | LOW    |
|234| Nh     |  8844 | unknown | -                      | LOW    |
|235| Dn     |  8878 | unknown | -                      | LOW    |
|236| Ih     |  8897 | unknown | -                      | LOW    |
|237| Lh     |  8947 | unknown | -                      | LOW    |
|238| Oh     |  8956 | unknown | -                      | LOW    |
|239| Kh     |  9261 | unknown | -                      | LOW    |
|240| Jh     |  9266 | unknown | -                      | LOW    |
|241| _h     |  9668 | unknown | -                      | LOW    |
|242| Al     |  9690 | unknown | -                      | LOW    |
|243| nl     |  9697 | unknown | -                      | LOW    |
|244| le     |  9718 | unknown | -                      | LOW    |
|245| ut     |  9897 | unknown | -                      | LOW    |
|246| al     |  9917 | unknown | -                      | LOW    |
|247| ol     |  9930 | unknown | -                      | LOW    |
|248| gt     |  9953 | unknown | -                      | LOW    |
|249| sl     |  9969 | unknown | -                      | LOW    |
|250| hl     |  9979 | unknown | -                      | LOW    |
|251| nc     | 10204 | unknown | -                      | LOW    |

---
Updated: 2026-09-28
