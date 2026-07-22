/**
 * 从网页数据导入237味常见中药到数据库
 * 数据来源：https://gdcmm.gzucm.edu.cn/info/1010/3637.htm
 */

require('dotenv').config({ path: __dirname + '/../.env' })
const mysql = require('mysql2/promise')

// 237味中药数据（从网页解析）
const herbData = `
解表药
1.麻黄：为发汗解表的要药；为用于肺气壅遏喘咳的要药。
2.白芷：为治疗阳明头痛的要药。
3.辛夷：为治疗鼻渊头痛、鼻塞流涕之要药。
4.紫苏：为治疗风寒感冒的常用药。
5.生姜：入脾经，善温中止呕，为"呕家圣药"。
6.荆芥：为发表散风通用药。
7.防风：为治风通用药；风药之润剂。
8.苍耳子：治鼻渊之良药。
9.香薷：夏月解表之麻黄。
10.细辛：为治感受风寒、风湿之多种痛证及鼻渊头痛之要药；为治寒饮伏肺之要药。
11.葛根：为治项背强痛之要药。
12.柴胡：为治疗少阳证的要药；为治疗疟疾寒热的常用药；为治疗肝胆证的要药。

清热药
13.石膏：为清泻肺胃二经气分实热的要药；为治疗气分高热和肺胃实火之要药。
14.栀子：治热病心烦、躁扰不宁之要药。
15.夏枯草：为治肝阳眩晕，目珠夜痛及瘰疬肿结之要药。
16.黄连：为治疗湿热火郁之要药；治疗泻痢的要药。
17.知母：为清泻肺胃二经气分实热的要药。
18.苦参：治湿热所致带下证及某些皮肤病常用药。
19.生地黄：为清热、凉血、止血之要药。
20.金银花：为治疗一切内痈外痈的要药。
21.蒲公英：为治疗乳痈的要药。
22.紫花地丁：尤以治疗疔毒为其特长。
23.野菊花：治外科疔痈之良药。
24.重楼：痈肿疔毒、毒蛇咬伤常用药。
25.漏芦：治乳痈之良药。
26.土茯苓：治梅毒之要药。
27.射干：为治疗咽喉肿痛的常用药。
28.龙胆草：为治肝经湿热实火之要药。
29.连翘：为"疮家圣药"。
30.大青叶：为治血热毒盛所致诸证之要药。
31.鱼腥草：为治疗肺痈的要药。
32.红藤、败酱草：为肠痈要药。
33.山豆根：治疗咽喉肿痛要药。
34.马勃：治咽喉肿痛常用药，对喉痹有出血和溃烂者尤宜。
35.马齿苋：治痢疾常用药。
36.半边莲：治热毒所致疮痈肿毒诸证常用药。
37.金荞麦：以治疗肺痈咯痰浓稠腥臭或咯吐脓血为其所长。
38.白头翁：为治疗热毒血痢之良药。
39.白蔹：常用于水火烫伤。
40.四季青：尤宜于治水火烫伤。
41.绿豆：善解热毒，如附子、巴豆、砒霜之毒等，为解毒良药。
42.牡丹皮：治无汗骨蒸之要药。
43.青蒿：善除疟疾寒热，为治疟疾之良药。
44.地骨皮：为退虚热、疗有汗骨蒸之佳品。
45.银柴胡：为退虚热、疗骨蒸之常用药。

泻下药
46.大黄：为治疗积滞便秘之要药，尤宜于实热便秘；瘀血诸证常用药。
47.芒硝：为治疗肠胃实热内结、燥屎坚硬难下之要药。
48.芦荟：取其杀虫之效，可外用治疗癣疮。
49.番泻叶：用于习惯性便秘及老年便秘。

祛风湿药
50.独活：为风湿痹痛主药，无问新久，均可应用。
51.威灵仙：为风湿痹痛之要药，性猛善走，走而不守，通行十二经。
52.徐长卿：为治风痹或痹症痛重之要药。
53.川乌：治风寒湿痹证之佳品，尤宜于寒邪偏盛者。
54.蕲蛇：透骨搜风，祛内外风邪，为截风要药，尤善治病深日久之顽痹。亦为抽搐痉挛之常用药，风毒之邪壅于肌肤亦为常用之品。乌梢蛇功同此而力不及，然无毒。
55.木瓜：为治疗风湿痹证，尤为湿痹、筋脉拘挛之要药。
56.松节：尤善治寒湿偏盛之风湿痹证，祛筋骨间风湿。
57.海风藤：风寒湿痹，肢节疼痛，筋脉拘挛，屈伸不利常用药。
58.昆明山海棠：治风寒湿痹日久，关节疼痛麻痹之良药。
59.雪上一枝蒿：擅止痛，治疗多种疼痛之良药。
60.秦艽：风药中之润剂，无问寒热新久均可配伍，热痹尤宜。亦为治虚热之要药。
61.防己：对风湿痹证，湿热偏盛、肢体酸重、关节红肿疼痛及湿热身痛者尤为要药。
62.桑枝：痹证无问寒热新久皆可，尤宜于风湿热痹，善走上肢。
63.海桐皮：尤善治下肢关节痹痛。
64.雷公藤：治风湿顽痹之要药。注意皮有大毒。
65.五加皮：滋补性祛风湿药，尤宜于老人及久病体虚者。
66.狗脊：对肝肾不足兼有风寒湿邪之腰痛脊强，不能俯仰者最为适宜。
67.千年健："颇宜于老人"，常与钻地风相须为用。
68.雪莲花：尤宜于风湿痹证而寒湿偏盛者。
69.桑寄生：为治肝肾亏虚、胎动不安之要药。

利水渗湿药
70.藿香：芳香化湿浊要药。能止呕，为治湿浊中阻所致呕吐最为捷要。
71.苍术：为治湿阻中焦之要药。风寒挟湿来犯，不用羌活便用苍术。
72.厚朴：行气、消积、除胀之要药。
73.砂仁：醒脾调胃要药，寒湿气滞者尤宜。为治妊娠气滞恶阻及胎动不安之佳品。
74.茯苓：利水消肿之要药。
75.车前子：利尿通淋，利小便以实大便。
76.滑石：为治湿热淋痛之良药；为治暑湿诸证之佳品；为治湿疮湿疹及痱毒之要药。
77.瞿麦：治淋证常用药，热淋尤宜。
78.萹蓄："善杀三虫"，蛔虫、蛲虫、钩虫。
79.木通：为治湿热淋痛及心火上炎或下移小肠之口舌生疮、心烦尿赤之要药；为治乳汁不下及热痹之要药。
80.海金沙：诸淋涩痛之要药，淋证常用辅药。
81.石韦：尤宜于血淋。
82.萆薢：善利湿分清泌浊，为治膏淋要药。
83.金钱草：为治石淋之要药；为治湿热黄疸、肝胆结石之佳品。
84.茵陈：为治湿热黄疸之要药。

温里药
85.附子：为补火助阳、回阳救逆之要药。
86.干姜：温中散寒之要药。
87.肉桂：为治疗下元虚冷、虚阳上浮诸证之要药；为治脾肾阳衰之佳品。
88.吴茱萸：治肝寒气滞诸痛之主药。为治中寒肝逆或寒郁肝脉诸痛之要药。为治疗脾肾阳虚，五更泄泻之常用药。
89.丁香：治胃寒呃逆之要药。

理气药
90.青皮：疏肝破气，较陈皮性更猛烈，偏入肝胆。
91.陈皮：为治痰之要药。
92.木香：为行气止痛之要药；也为治疗湿热泻痢、里急后重之要药。
93.香附：疏肝解郁，行气止痹痛之要药。为妇科调经之要药。"乃气病之总司，女可之主帅也"，为气中血药。
94.薤白：为治疗胸痹之要药。
95.大腹皮：宽中利气之截药。

消食药
96.山楂：为消化油腻、肉食积滞之要药。
97.神曲：治食滞兼外感表证。
98.麦芽：治米面薯芋食滞，且能回乳。
99.莱菔子：饮食积滞兼气滞者。
100.鸡内金：为消食运脾之要药。

驱虫药
101.使君子：为治蛔虫病之要药；为治小儿疳积之要药。忌与茶饮。
102.苦楝皮：广谱驱虫中药，主驱蛔虫。
103.槟榔：驱绦虫，兼能泻下虫体。
104.南瓜子：驱绦虫，与槟榔同用。
105.鹤草芽：驱绦虫。
106.雷丸：广谱杀虫，尤宜绦虫，能直接杀虫。

止血药
107.大蓟：为治血热妄行之要药。
108.小蓟：为治血热妄行及疮痈肿毒之要药。
109.地榆：为治血热出血特别是下焦出血之佳品；为治疗水火烫伤之要药。
110.侧柏叶：治各种出血病症之要药，血热者尤宜。
111.苎麻根：止血清热安胎，历来视为安胎要药。
112.三七：为治出血、瘀血诸证之要药。为伤科要药。
113.茜草：妇科调经之要药。
114.蒲黄：止血行瘀之良药。血证无论寒热有无瘀滞均可，实夹瘀者尤宜，尤为妇科常用药。
115.降香：跌打损伤之内外出血证，外科常用之品。
116.白及：为收敛止血之要药，尤多用于肺胃出血证。亦为外疡消肿生肌常用药。
117.棕榈炭：收敛止血之要药，尤多用于崩漏。敛性强，应以无瘀者为宜。
118.艾叶：温经止血之要药。为妇科下焦虚寒或寒克胞宫之要药；也为安胎要药。
119.炮姜：治脾不统血之出血病症。
120.灶心土：温经止血之要药，尤对吐血便血者更佳。

活血化瘀药
121.川芎："血中之气药"，为治疗血瘀气滞之要药。"下调经水，中开郁结"，为妇科要药。能"上行头目"，也为治疗头痛要药。
122.延胡索：能"行血中气滞，气中血滞，故专治一身上下诸痛"，为活血化瘀止痛之良药。
123.郁金：活血行气凉血之要药。
124.虎杖：为治烫伤及毒蛇咬伤之要药。
125.姜黄：长于行肢臂而除痹痛。
126.乳香：外伤科要药。定诸经之痛，散瘀止痛，活血消痈，且祛腐生肌。
127.没药：与乳香同为外伤科要药。
128.五灵脂：治疗瘀滞疼痛之要药，常与蒲黄相须，如《失笑散》。
129.丹参："一味丹参散，功同四物汤"，丹参为妇科调经常用药，活血调经之良药。
130.红花：为活血化瘀、通经止痛之要药，也是妇产血瘀病症的常用药；并为治疗跌打损伤、瘀滞肿痛之要药。
131.桃仁：为治疗肠燥便秘、肠痈、肺痈之佳品。
132.益母草：为治妇科经产病之要药。
133.泽兰：为治妇科经产淤血病症常用药，尤宜于水瘀互阻之水肿。
134.牛膝：为治疗经产病之要药，活血祛瘀中有疏利降泄，善引火（血）下行。
135.鸡血藤：治疗经脉不畅，络脉不和常用药。
136.王不留行：为下乳要药。
137.土鳖虫：伤科常用药，尤多用于骨折伤筋淤血肿痛。
138.马钱子：消肿散结止痛，伤科疗伤止痛之佳品。亦为治疗风湿顽痹、拘挛疼痛、麻木瘫痪之常用药。
139.自然铜：促进骨折愈合，为伤科要药。
140.苏木："扑损瘀血"妇科瘀滞经产诸证及其它瘀滞病症常用药。
141.骨碎补：伤科要药，以其能入肾治骨，能治骨伤碎而得名。
142.血竭：伤科及其他瘀滞痛证要药。
143.莪术：专攻气中之血，香附而外又一"气中血药"，适用于气滞血瘀食积日久而成症瘕积聚，以及气滞血瘀食停寒凝所致诸般痹痛，常与三棱相须为用。
144.三棱：功类莪术，均能破气行血、消积止痛。三棱偏破血，莪术偏破气。

化痰止咳平喘药
145.半夏：为治湿痰、寒痰之要药，尤宜治脏腑湿痰。半夏味苦能降逆和胃，为止呕要药，尤宜于痰饮或胃寒所致胃气上逆呕吐。
146.禹白附：祛风痰止痛，其性上行，尤善治头面部诸疾。
147.白芥子：善除"皮里膜外之痰"，利气豁痰。
148.皂荚：顽痰胶阻于肺，见咳逆上气，时吐稠痰，难以平卧者尤宜。
149.旋覆花：为治肺胃气逆之要药。"诸花皆升，旋覆独降"，旋覆花能降气化痰，降逆止呕。
150.白前：无论寒热、外感内伤、新嗽久咳均可用之，尤宜于痰湿或寒痰阻肺，肺气失降者。
151.川贝：在"润"，尤宜内伤久咳，燥痰热痰之证，为治疗热痰及燥痰咳嗽之常用药。
152.浙贝：在"泄"，多用治风热咳嗽及痰热郁肺之咳嗽，为治疗肺热咳嗽之常用药。
153.竹沥：治痰热咳嗽，痰稠难咯、顽痰胶结者最宜。
154.竹茹：治胃热呕吐之要药。
155.天竺黄：清化热痰，清心定惊，与竹沥同而无寒滑之弊。
156.前胡：与白前相须而化痰之力不及，其性凉，用于外感咳喘不热者。
157.桔梗：其性善上行。"一为诸药之舟楫，一为肺部之引经"，能载药上行。
158.礞石：治惊痫之良药，攻消痰积、平肝镇惊。
159.杏仁：为治疗咳喘的要药。
160.百部：功专润肺止咳，为治疗新久咳嗽之要药，并能杀虫灭虱。
161.紫菀：甘润苦泄，性温而不热，质润而不燥，长于润肺下气，开肺郁，化痰浊。凡咳嗽症，无论外感内伤、病程长短、寒热虚实皆可用之。
162.马兜铃：热郁于肺，肺失肃降而发为咳嗽痰喘者最宜。
163.桑白皮：泻肺平喘，利水消肿。力缓，清肺热降肺火，尤宜风水皮水等阳水实证。
164.葶苈子：泻肺平喘，利水消肿。力峻。泻肺中水气痰涎，邪盛喘满不得卧者尤宜。
165.白果：治妇女带下属脾肾亏虚色清质稀者最宜。敛肺化痰定喘，若配麻黄则"敛肺而不留邪，宣肺而不耗气"。
166.洋金花：麻醉镇咳平喘药。对成人老人咳喘无痰、痰少而他药无效者用之。
167.瓜蒌：为治肺热咳嗽、胸痹心痛之要药。
168.胖大海：本品甘寒质轻能清宣肺气，化痰利咽开音。常单味泡服，也可配桔梗、甘草等同用。

安神药
169.朱砂：既重镇安神又清心安神，为镇心清火，安神定志之药。
170.龙骨：重镇安神常用药。
171.酸枣仁：养心安神要药。
172.缬草：安神镇静，祛风解痉。
173.合欢皮：善解肝郁，为悦心安神药。
174.远志：交通心肾，安定神志，益智强识之佳品。

平肝息风药
175.石决明：凉肝镇肝之要药，对肝肾阴虚、肝阳眩晕尤宜。
176.代赭石：为重镇降逆要药，尤善降胃气逆。亦为重镇潜阳常用之品。
177.刺蒺藜：祛风明目要药，善疏肝经风热。
178.生铁落：用于肝郁火盛之怒狂阳厥证。
179.羚羊角：为治疗肝风内动，惊痫抽搐之要药，尤宜于热极生风所致者。
180.牛黄：为清热解毒良药，常用治小儿急惊风之壮热神昏、惊厥抽搐等症。
181.珍珠：多用以治多种眼疾。
182.钩藤：多用于肝阳化风者，尤宜于热极生风四肢抽搐及小儿高热惊风。
183.天麻：天麻可平肝阳、息肝风，药性平和，对各种病因的肝风内动、惊痫抽搐，无论寒热虚实均可应用。
184.全蝎：治疗痉挛抽搐之要药，其力不逊羚羊角。
185.蜈蚣：通达内外，搜风定搐之力强，与全蝎皆为息风要药。
186.僵蚕：对惊风癫痫而挟痰热者尤宜。

开窍药
187.麝香：为醒神回苏之要药，各种原因之闭证神昏，无论寒热皆效。另可催生下胎。
188.苏合香：治面青、身凉、苔白、脉迟之寒闭神昏要药。
189.冰片：凉开之品。
190.石菖蒲：擅长治痰湿秽浊之邪蒙蔽清窍所致神志昏乱。

补虚药
191.人参：大补元气，为救脱要药。
192.西洋参：补气药中清补之品，性凉，气阴双补。
193.党参：气血双补。
194.太子参：补气药中清补之品，性平，气阴不足轻症火不盛及小儿，宜用。
195.黄芪：为补中益气要药，治气虚水肿要药，为"补药之长"。
196.白术：为补气健脾要药。
197.山药：为平补气阴之佳品。
198.甘草：补脾益气，祛痰止咳，缓急止痛，清热解毒，调和诸药，号称"国老"。
199.大枣：治疗心失充养，心神无主而"脏燥"之要药。
200.沙棘：为藏医蒙医治咳喘痰多较常用药。
201.饴糖：尤宜于脾胃虚寒之脘腹疼痛，喜按，空腹时痛甚，食后稍安者。另用于小儿发育五迟。
202.鹿茸：助阳之力强而起效慢，用治慢性阳虚，治急性力不及附子。为温肾壮阳、补督脉、益精血的要药。
203.淫羊藿：亦称"仙灵脾"或弃杖草，补肾壮阳，祛风除湿。
204.巴戟天：对肾阳虚兼风湿者尤宜。
205.杜仲：为治肾虚腰膝酸痛或筋骨无力之要药，续断亦是如此。杜仲亦为治肝肾亏虚、胎漏胎动之佳品。
206.肉苁蓉：补肾阳、益精血之要药。
207.菟丝子：亦为平补阴阳之品，功能补肾阳、益肾精以固精缩尿，安胎。
208.蛤蚧：治多种虚证咳喘之佳品，有固本培元之功。
209.益智仁：为治脾寒泻痛或多涎唾之要药。
210.冬虫夏草：有兴阳起萎之功，亦为平补肺肾之佳品，尤宜劳嗽痰血者。
211.海马：有补肾壮阳、续接真气之功，治肾虚作喘。
212.当归：妇科调经之要药；内科补血之佳品；为活血行淤之要药。
213.乌贼骨：为妇科之良药。
214.熟地黄：为养血补虚之要药；为补肾阴之要药。"大补五脏真阴"，"大补真水"。
215.白芍：治肝阳上亢头痛眩晕。
216.阿胶：甘平质润，为补血要药，尤以治出血致血虚为佳。味甘质粘，为止血要药。
217.何首乌：为滋补良药。
218.枸杞子：为平补肾精肝血之佳品。

收涩药
219.麻黄根：敛肺固表止汗之要药。
220.浮小麦：为养心敛液、固表止汗之佳品。
221.五味子：为治疗久咳虚喘之要药；治肾虚精关不固，遗精滑精之常用药。
222.乌梅：治疗久泻久痢之常用药。
223.罂粟壳：为涩肠止泻之圣药，适用于久泻久痢而无邪滞者。
224.诃子：治疗久泻久痢之常用药；治失音之要药。为藏药之"百药之王"，其位似甘草。
225.石榴皮：治疗久泻久痢之常用药。
226.赤石脂：治疗久泻久痢、下痢脓血之常用药物，常与禹余粮相须。
227.山茱萸：为平补阴阳之要药；为固精止遗的要药；为防止元气虚脱之要药。
228.桑螵蛸：治疗肾虚不固之遗精滑精、遗尿尿频、白浊之良药。
229.海螵蛸：为治疗胃脘痛、胃酸过多之佳品。
230.莲子：治疗脾虚、肾虚、带下。
231.芡实：治疗带下证之佳品。
232.椿皮：止带之常用药物，尤宜于血热、崩漏、便血者。
233.鸡冠花：治疗带下证之常用之品。

涌吐药
234.常山：为治疟疾之要药，尤以间日疟、三日疟为佳。
235.硫磺：治疗疥疮之要药。
236.蛇床子：为皮肤及妇科常用药。
237.蜂房：外科常用之品。
`

// 解析数据
function parseHerbData(data) {
  const lines = data.trim().split('\n')
  const herbs = []
  let currentCategory = ''

  for (const line of lines) {
    if (!line.trim()) continue

    // 检查是否是分类标题（不包含数字）
    if (!line.match(/^\d+\./)) {
      if (line.includes('药') || line === '涌吐药') {
        currentCategory = line.trim()
      }
      continue
    }

    // 解析药材行
    const match = line.match(/^\d+\.(.+?)：(.+)$/)
    if (match) {
      const name = match[1].trim()
      const indication = match[2].trim()
      herbs.push({
        name,
        category: currentCategory,
        indication
      })
    }
  }

  return herbs
}

// 药材补充信息（常见药材的拼音、性味、归经等）
const herbDetails = {
  '麻黄': { pinyin: 'má huáng', nature: '温', taste: '辛、微苦', meridian: '肺、膀胱' },
  '白芷': { pinyin: 'bái zhǐ', nature: '温', taste: '辛', meridian: '胃、大肠、肺' },
  '辛夷': { pinyin: 'xīn yí', nature: '温', taste: '辛', meridian: '肺、胃' },
  '紫苏': { pinyin: 'zǐ sū', nature: '温', taste: '辛', meridian: '肺、脾' },
  '生姜': { pinyin: 'shēng jiāng', nature: '温', taste: '辛', meridian: '肺、脾、胃' },
  '荆芥': { pinyin: 'jīng jiè', nature: '微温', taste: '辛', meridian: '肺、肝' },
  '防风': { pinyin: 'fáng fēng', nature: '微温', taste: '辛、甘', meridian: '膀胱、肝、脾' },
  '苍耳子': { pinyin: 'cāng ěr zǐ', nature: '温', taste: '辛、苦', meridian: '肺' },
  '香薷': { pinyin: 'xiāng rú', nature: '微温', taste: '辛', meridian: '肺、胃' },
  '细辛': { pinyin: 'xì xīn', nature: '温', taste: '辛', meridian: '肺、肾、心' },
  '葛根': { pinyin: 'gé gēn', nature: '凉', taste: '甘、辛', meridian: '脾、胃' },
  '柴胡': { pinyin: 'chái hú', nature: '微寒', taste: '苦、辛', meridian: '肝、胆' },
  '石膏': { pinyin: 'shí gāo', nature: '大寒', taste: '甘、辛', meridian: '肺、胃' },
  '栀子': { pinyin: 'zhī zǐ', nature: '寒', taste: '苦', meridian: '心、肺、三焦' },
  '夏枯草': { pinyin: 'xià kū cǎo', nature: '寒', taste: '苦、辛', meridian: '肝、胆' },
  '黄连': { pinyin: 'huáng lián', nature: '寒', taste: '苦', meridian: '心、脾、胃、肝、胆、大肠' },
  '知母': { pinyin: 'zhī mǔ', nature: '寒', taste: '苦、甘', meridian: '肺、胃、肾' },
  '苦参': { pinyin: 'kǔ shēn', nature: '寒', taste: '苦', meridian: '心、肝、胃、大肠、膀胱' },
  '生地黄': { pinyin: 'shēng dì huáng', nature: '寒', taste: '甘、苦', meridian: '心、肝、肾' },
  '金银花': { pinyin: 'jīn yín huā', nature: '寒', taste: '甘', meridian: '肺、心、胃' },
  '蒲公英': { pinyin: 'pú gōng yīng', nature: '寒', taste: '苦、甘', meridian: '肝、胃' },
  '紫花地丁': { pinyin: 'zǐ huā dì dīng', nature: '寒', taste: '苦、辛', meridian: '心、肝' },
  '野菊花': { pinyin: 'yě jú huā', nature: '微寒', taste: '苦、辛', meridian: '肝' },
  '重楼': { pinyin: 'chóng lóu', nature: '微寒', taste: '苦', meridian: '肝' },
  '漏芦': { pinyin: 'lòu lú', nature: '寒', taste: '苦', meridian: '胃' },
  '土茯苓': { pinyin: 'tǔ fú líng', nature: '平', taste: '甘、淡', meridian: '肝、胃' },
  '射干': { pinyin: 'shè gàn', nature: '寒', taste: '苦', meridian: '肺' },
  '龙胆草': { pinyin: 'lóng dǎn cǎo', nature: '寒', taste: '苦', meridian: '肝、胆' },
  '连翘': { pinyin: 'lián qiào', nature: '微寒', taste: '苦', meridian: '肺、心、小肠' },
  '大青叶': { pinyin: 'dà qīng yè', nature: '寒', taste: '苦', meridian: '心、胃' },
  '鱼腥草': { pinyin: 'yú xīng cǎo', nature: '微寒', taste: '辛', meridian: '肺' },
  '红藤': { pinyin: 'hóng téng', nature: '平', taste: '苦', meridian: '大肠、肝' },
  '败酱草': { pinyin: 'bài jiàng cǎo', nature: '微寒', taste: '苦、辛', meridian: '胃、大肠、肝' },
  '山豆根': { pinyin: 'shān dòu gēn', nature: '寒', taste: '苦', meridian: '肺、胃' },
  '马勃': { pinyin: 'mǎ bó', nature: '平', taste: '辛', meridian: '肺' },
  '马齿苋': { pinyin: 'mǎ chǐ xiàn', nature: '寒', taste: '酸', meridian: '肝、大肠' },
  '半边莲': { pinyin: 'bàn biān lián', nature: '平', taste: '甘、淡', meridian: '心、小肠、肺' },
  '金荞麦': { pinyin: 'jīn qiáo mài', nature: '凉', taste: '苦', meridian: '肺' },
  '白头翁': { pinyin: 'bái tóu wēng', nature: '寒', taste: '苦', meridian: '大肠' },
  '白蔹': { pinyin: 'bái liǎn', nature: '微寒', taste: '苦、辛', meridian: '心、胃' },
  '四季青': { pinyin: 'sì jì qīng', nature: '凉', taste: '苦、涩', meridian: '肺、心' },
  '绿豆': { pinyin: 'lǜ dòu', nature: '寒', taste: '甘', meridian: '心、胃' },
  '牡丹皮': { pinyin: 'mǔ dān pí', nature: '微寒', taste: '苦、辛', meridian: '心、肝、肾' },
  '青蒿': { pinyin: 'qīng hāo', nature: '寒', taste: '苦、辛', meridian: '肝、胆' },
  '地骨皮': { pinyin: 'dì gǔ pí', nature: '寒', taste: '甘', meridian: '肺、肝、肾' },
  '银柴胡': { pinyin: 'yín chái hú', nature: '微寒', taste: '甘', meridian: '肝、胃' },
  '大黄': { pinyin: 'dà huáng', nature: '寒', taste: '苦', meridian: '脾、胃、大肠、肝、心' },
  '芒硝': { pinyin: 'máng xiāo', nature: '寒', taste: '咸、苦', meridian: '胃、大肠' },
  '芦荟': { pinyin: 'lú huì', nature: '寒', taste: '苦', meridian: '肝、胃、大肠' },
  '番泻叶': { pinyin: 'fān xiè yè', nature: '寒', taste: '甘、苦', meridian: '大肠' },
  '独活': { pinyin: 'dú huó', nature: '微温', taste: '苦、辛', meridian: '肾、膀胱' },
  '威灵仙': { pinyin: 'wēi líng xiān', nature: '温', taste: '辛、咸', meridian: '膀胱' },
  '徐长卿': { pinyin: 'xú cháng qīng', nature: '温', taste: '辛', meridian: '肝、胃' },
  '川乌': { pinyin: 'chuān wū', nature: '热', taste: '苦、辛', meridian: '心、肝、脾、肾' },
  '蕲蛇': { pinyin: 'qí shé', nature: '温', taste: '甘、咸', meridian: '肝' },
  '木瓜': { pinyin: 'mù guā', nature: '温', taste: '酸', meridian: '肝、脾' },
  '松节': { pinyin: 'sōng jié', nature: '温', taste: '苦', meridian: '肝、肾' },
  '海风藤': { pinyin: 'hǎi fēng téng', nature: '微温', taste: '辛、苦', meridian: '肝' },
  '昆明山海棠': { pinyin: 'kūn míng shān hǎi táng', nature: '温', taste: '苦、辛', meridian: '肝、脾' },
  '雪上一枝蒿': { pinyin: 'xuě shàng yī zhī hāo', nature: '温', taste: '苦、辛', meridian: '肝' },
  '秦艽': { pinyin: 'qín jiāo', nature: '微寒', taste: '苦、辛', meridian: '胃、肝、胆' },
  '防己': { pinyin: 'fáng jǐ', nature: '寒', taste: '苦、辛', meridian: '膀胱、肺' },
  '桑枝': { pinyin: 'sāng zhī', nature: '平', taste: '苦', meridian: '肝' },
  '海桐皮': { pinyin: 'hǎi tóng pí', nature: '平', taste: '苦、辛', meridian: '肝' },
  '雷公藤': { pinyin: 'léi gōng téng', nature: '寒', taste: '苦', meridian: '心、肝' },
  '五加皮': { pinyin: 'wǔ jiā pí', nature: '温', taste: '辛、苦', meridian: '肝、肾' },
  '狗脊': { pinyin: 'gǒu jǐ', nature: '温', taste: '苦、甘', meridian: '肝、肾' },
  '千年健': { pinyin: 'qiān nián jiàn', nature: '温', taste: '苦、辛', meridian: '肝、肾' },
  '雪莲花': { pinyin: 'xuě lián huā', nature: '温', taste: '甘、苦', meridian: '肝、肾' },
  '桑寄生': { pinyin: 'sāng jì shēng', nature: '平', taste: '苦、甘', meridian: '肝、肾' },
  '藿香': { pinyin: 'huò xiāng', nature: '微温', taste: '辛', meridian: '脾、胃、肺' },
  '苍术': { pinyin: 'cāng zhú', nature: '温', taste: '苦、辛', meridian: '脾、胃' },
  '厚朴': { pinyin: 'hòu pò', nature: '温', taste: '苦、辛', meridian: '脾、胃、肺、大肠' },
  '砂仁': { pinyin: 'shā rén', nature: '温', taste: '辛', meridian: '脾、胃、肾' },
  '茯苓': { pinyin: 'fú líng', nature: '平', taste: '甘、淡', meridian: '心、脾、肾' },
  '车前子': { pinyin: 'chē qián zǐ', nature: '寒', taste: '甘', meridian: '肾、肝、肺' },
  '滑石': { pinyin: 'huá shí', nature: '寒', taste: '甘、淡', meridian: '膀胱、肺、胃' },
  '瞿麦': { pinyin: 'qú mài', nature: '寒', taste: '苦', meridian: '心、小肠、膀胱' },
  '萹蓄': { pinyin: 'biǎn xù', nature: '微寒', taste: '苦', meridian: '膀胱' },
  '木通': { pinyin: 'mù tōng', nature: '寒', taste: '苦', meridian: '心、小肠、膀胱' },
  '海金沙': { pinyin: 'hǎi jīn shā', nature: '寒', taste: '甘、咸', meridian: '膀胱、小肠' },
  '石韦': { pinyin: 'shí wéi', nature: '微寒', taste: '苦、甘', meridian: '肺、膀胱' },
  '萆薢': { pinyin: 'bì xiè', nature: '平', taste: '苦', meridian: '肾、胃' },
  '金钱草': { pinyin: 'jīn qián cǎo', nature: '微寒', taste: '甘、咸', meridian: '肝、胆、肾、膀胱' },
  '茵陈': { pinyin: 'yīn chén', nature: '微寒', taste: '苦', meridian: '脾、胃、肝、胆' },
  '附子': { pinyin: 'fù zǐ', nature: '热', taste: '辛', meridian: '心、肾、脾' },
  '干姜': { pinyin: 'gān jiāng', nature: '热', taste: '辛', meridian: '脾、胃、肾、心、肺' },
  '肉桂': { pinyin: 'ròu guì', nature: '热', taste: '辛、甘', meridian: '肾、脾、心、肝' },
  '吴茱萸': { pinyin: 'wú zhū yú', nature: '热', taste: '辛、苦', meridian: '肝、脾、胃、肾' },
  '丁香': { pinyin: 'dīng xiāng', nature: '温', taste: '辛', meridian: '脾、胃、肾' },
  '青皮': { pinyin: 'qīng pí', nature: '温', taste: '苦、辛', meridian: '肝、胆、胃' },
  '陈皮': { pinyin: 'chén pí', nature: '温', taste: '苦、辛', meridian: '脾、肺' },
  '木香': { pinyin: 'mù xiāng', nature: '温', taste: '苦、辛', meridian: '脾、胃、大肠、胆' },
  '香附': { pinyin: 'xiāng fù', nature: '平', taste: '辛、微苦', meridian: '肝、三焦' },
  '薤白': { pinyin: 'xiè bái', nature: '温', taste: '辛、苦', meridian: '肺、心、胃、大肠' },
  '大腹皮': { pinyin: 'dà fù pí', nature: '微温', taste: '辛', meridian: '脾、胃、大肠、小肠' },
  '山楂': { pinyin: 'shān zhā', nature: '微温', taste: '酸、甘', meridian: '脾、胃、肝' },
  '神曲': { pinyin: 'shén qū', nature: '温', taste: '甘、辛', meridian: '脾、胃' },
  '麦芽': { pinyin: 'mài yá', nature: '平', taste: '甘', meridian: '脾、胃、肝' },
  '莱菔子': { pinyin: 'lái fú zǐ', nature: '平', taste: '甘、辛', meridian: '脾、胃、肺' },
  '鸡内金': { pinyin: 'jī nèi jīn', nature: '平', taste: '甘', meridian: '脾、胃、小肠、膀胱' },
  '使君子': { pinyin: 'shǐ jūn zǐ', nature: '温', taste: '甘', meridian: '脾、胃' },
  '苦楝皮': { pinyin: 'kǔ liàn pí', nature: '寒', taste: '苦', meridian: '脾、胃、肝' },
  '槟榔': { pinyin: 'bīng láng', nature: '温', taste: '苦、辛', meridian: '胃、大肠' },
  '南瓜子': { pinyin: 'nán guā zǐ', nature: '平', taste: '甘', meridian: '胃、大肠' },
  '鹤草芽': { pinyin: 'hè cǎo yá', nature: '凉', taste: '苦、涩', meridian: '肝、大肠' },
  '雷丸': { pinyin: 'léi wán', nature: '寒', taste: '苦', meridian: '胃、大肠' },
  '大蓟': { pinyin: 'dà jì', nature: '凉', taste: '苦、甘', meridian: '心、肝' },
  '小蓟': { pinyin: 'xiǎo jì', nature: '凉', taste: '苦、甘', meridian: '心、肝' },
  '地榆': { pinyin: 'dì yú', nature: '微寒', taste: '苦、酸', meridian: '肝、大肠' },
  '侧柏叶': { pinyin: 'cè bǎi yè', nature: '寒', taste: '苦、涩', meridian: '肺、肝、脾' },
  '苎麻根': { pinyin: 'zhù má gēn', nature: '寒', taste: '甘', meridian: '心、肝' },
  '三七': { pinyin: 'sān qī', nature: '温', taste: '甘、微苦', meridian: '肝、胃' },
  '茜草': { pinyin: 'qiàn cǎo', nature: '寒', taste: '苦', meridian: '肝' },
  '蒲黄': { pinyin: 'pú huáng', nature: '平', taste: '甘', meridian: '肝、心包' },
  '降香': { pinyin: 'jiàng xiāng', nature: '温', taste: '辛', meridian: '肝、脾' },
  '白及': { pinyin: 'bái jí', nature: '微寒', taste: '苦、甘、涩', meridian: '肺、胃、肝' },
  '棕榈炭': { pinyin: 'zōng lú tàn', nature: '平', taste: '苦、涩', meridian: '肝、肺、大肠' },
  '艾叶': { pinyin: 'ài yè', nature: '温', taste: '苦、辛', meridian: '脾、肝、肾' },
  '炮姜': { pinyin: 'pào jiāng', nature: '热', taste: '苦、涩', meridian: '脾、肝' },
  '灶心土': { pinyin: 'zào xīn tǔ', nature: '温', taste: '辛', meridian: '脾、胃' },
  '川芎': { pinyin: 'chuān xiōng', nature: '温', taste: '辛', meridian: '肝、胆、心包' },
  '延胡索': { pinyin: 'yán hú suǒ', nature: '温', taste: '苦、辛', meridian: '心、肝、脾' },
  '郁金': { pinyin: 'yù jīn', nature: '寒', taste: '苦、辛', meridian: '肝、胆、心' },
  '虎杖': { pinyin: 'hǔ zhàng', nature: '微寒', taste: '苦', meridian: '肝、胆、肺' },
  '姜黄': { pinyin: 'jiāng huáng', nature: '温', taste: '苦、辛', meridian: '脾、肝' },
  '乳香': { pinyin: 'rǔ xiāng', nature: '温', taste: '苦、辛', meridian: '心、肝、脾' },
  '没药': { pinyin: 'mò yào', nature: '平', taste: '苦、辛', meridian: '心、肝' },
  '五灵脂': { pinyin: 'wǔ líng zhī', nature: '温', taste: '苦、咸、甘', meridian: '肝' },
  '丹参': { pinyin: 'dān shēn', nature: '微寒', taste: '苦', meridian: '心、心包、肝' },
  '红花': { pinyin: 'hóng huā', nature: '温', taste: '辛', meridian: '心、肝' },
  '桃仁': { pinyin: 'táo rén', nature: '平', taste: '苦、甘', meridian: '心、肝、大肠' },
  '益母草': { pinyin: 'yì mǔ cǎo', nature: '微寒', taste: '苦、辛', meridian: '心、肝、膀胱' },
  '泽兰': { pinyin: 'zé lán', nature: '微温', taste: '苦、辛', meridian: '肝、脾' },
  '牛膝': { pinyin: 'niú xī', nature: '平', taste: '苦、甘、酸', meridian: '肝、肾' },
  '鸡血藤': { pinyin: 'jī xuè téng', nature: '温', taste: '苦、甘', meridian: '肝、肾' },
  '王不留行': { pinyin: 'wáng bù liú xíng', nature: '平', taste: '苦', meridian: '肝、胃' },
  '土鳖虫': { pinyin: 'tǔ biē chóng', nature: '寒', taste: '咸', meridian: '肝' },
  '马钱子': { pinyin: 'mǎ qián zǐ', nature: '温', taste: '苦', meridian: '肝、脾' },
  '自然铜': { pinyin: 'zì rán tóng', nature: '平', taste: '辛', meridian: '肝' },
  '苏木': { pinyin: 'sū mù', nature: '平', taste: '甘、咸', meridian: '心、肝、脾' },
  '骨碎补': { pinyin: 'gǔ suì bǔ', nature: '温', taste: '苦', meridian: '肝、肾' },
  '血竭': { pinyin: 'xuè jié', nature: '平', taste: '甘、咸', meridian: '心、肝' },
  '莪术': { pinyin: 'é zhú', nature: '温', taste: '苦、辛', meridian: '肝、脾' },
  '三棱': { pinyin: 'sān léng', nature: '平', taste: '苦、辛', meridian: '肝、脾' },
  '半夏': { pinyin: 'bàn xià', nature: '温', taste: '苦、辛', meridian: '脾、胃、肺' },
  '禹白附': { pinyin: 'yǔ bái fù', nature: '温', taste: '辛、甘', meridian: '肝、胃' },
  '白芥子': { pinyin: 'bái jiè zǐ', nature: '温', taste: '辛', meridian: '肺、胃' },
  '皂荚': { pinyin: 'zào jiá', nature: '温', taste: '辛', meridian: '肺、大肠' },
  '旋覆花': { pinyin: 'xuán fù huā', nature: '微温', taste: '苦、辛、咸', meridian: '肺、胃' },
  '白前': { pinyin: 'bái qián', nature: '微温', taste: '苦、辛', meridian: '肺' },
  '川贝': { pinyin: 'chuān bèi', nature: '微寒', taste: '苦、甘', meridian: '心、肺' },
  '浙贝': { pinyin: 'zhè bèi', nature: '寒', taste: '苦', meridian: '心、肺' },
  '竹沥': { pinyin: 'zhú lì', nature: '寒', taste: '甘', meridian: '心、肺、胃' },
  '竹茹': { pinyin: 'zhú rú', nature: '微寒', taste: '甘', meridian: '肺、胃、心' },
  '天竺黄': { pinyin: 'tiān zhú huáng', nature: '寒', taste: '甘', meridian: '心、肝' },
  '前胡': { pinyin: 'qián hú', nature: '微寒', taste: '苦、辛', meridian: '肺' },
  '桔梗': { pinyin: 'jú gěng', nature: '平', taste: '苦、辛', meridian: '肺' },
  '礞石': { pinyin: 'méng shí', nature: '平', taste: '咸', meridian: '肺、肝' },
  '杏仁': { pinyin: 'xìng rén', nature: '温', taste: '苦', meridian: '肺、大肠' },
  '百部': { pinyin: 'bǎi bù', nature: '微温', taste: '苦', meridian: '肺' },
  '紫菀': { pinyin: 'zǐ wǎn', nature: '温', taste: '苦、甘', meridian: '肺' },
  '马兜铃': { pinyin: 'mǎ dōu líng', nature: '寒', taste: '苦', meridian: '肺、大肠' },
  '桑白皮': { pinyin: 'sāng bái pí', nature: '寒', taste: '甘', meridian: '肺' },
  '葶苈子': { pinyin: 'tíng lì zǐ', nature: '大寒', taste: '苦、辛', meridian: '肺、膀胱' },
  '白果': { pinyin: 'bái guǒ', nature: '平', taste: '甘、苦、涩', meridian: '肺、肾' },
  '洋金花': { pinyin: 'yáng jīn huā', nature: '温', taste: '辛', meridian: '肺、肝' },
  '瓜蒌': { pinyin: 'guā lóu', nature: '寒', taste: '苦、甘', meridian: '肺、胃、大肠' },
  '胖大海': { pinyin: 'pàng dà hǎi', nature: '寒', taste: '甘', meridian: '肺、大肠' },
  '朱砂': { pinyin: 'zhū shā', nature: '寒', taste: '甘', meridian: '心' },
  '龙骨': { pinyin: 'lóng gǔ', nature: '平', taste: '甘、涩', meridian: '心、肝、肾' },
  '酸枣仁': { pinyin: 'suān zǎo rén', nature: '平', taste: '酸、甘', meridian: '心、肝、胆' },
  '缬草': { pinyin: 'xié cǎo', nature: '温', taste: '苦', meridian: '心、肝' },
  '合欢皮': { pinyin: 'hé huān pí', nature: '平', taste: '甘', meridian: '心、肝' },
  '远志': { pinyin: 'yuǎn zhì', nature: '温', taste: '苦、辛', meridian: '心、肾、肺' },
  '石决明': { pinyin: 'shí jué míng', nature: '寒', taste: '咸', meridian: '肝' },
  '代赭石': { pinyin: 'dài zhě shí', nature: '寒', taste: '苦', meridian: '心、肝、胃' },
  '刺蒺藜': { pinyin: 'cì jí lí', nature: '微温', taste: '苦、辛', meridian: '肝' },
  '生铁落': { pinyin: 'shēng tiě luò', nature: '寒', taste: '辛', meridian: '心、肝' },
  '羚羊角': { pinyin: 'líng yáng jiǎo', nature: '寒', taste: '咸', meridian: '肝、心' },
  '牛黄': { pinyin: 'niú huáng', nature: '凉', taste: '苦', meridian: '心、肝' },
  '珍珠': { pinyin: 'zhēn zhū', nature: '寒', taste: '甘、咸', meridian: '心、肝' },
  '钩藤': { pinyin: 'gōu téng', nature: '微寒', taste: '甘', meridian: '肝、心包' },
  '天麻': { pinyin: 'tiān má', nature: '平', taste: '甘', meridian: '肝' },
  '全蝎': { pinyin: 'quán xiē', nature: '平', taste: '辛', meridian: '肝' },
  '蜈蚣': { pinyin: 'wú gōng', nature: '温', taste: '辛', meridian: '肝' },
  '僵蚕': { pinyin: 'jiāng cán', nature: '平', taste: '咸、辛', meridian: '肝、肺' },
  '麝香': { pinyin: 'shè xiāng', nature: '温', taste: '辛', meridian: '心、脾' },
  '苏合香': { pinyin: 'sū hé xiāng', nature: '温', taste: '辛', meridian: '心、脾' },
  '冰片': { pinyin: 'bīng piàn', nature: '微寒', taste: '苦、辛', meridian: '心、脾、肺' },
  '石菖蒲': { pinyin: 'shí chāng pú', nature: '温', taste: '苦、辛', meridian: '心、胃' },
  '人参': { pinyin: 'rén shēn', nature: '微温', taste: '甘、微苦', meridian: '脾、肺、心' },
  '西洋参': { pinyin: 'xī yáng shēn', nature: '寒', taste: '苦、微甘', meridian: '肺、心、肾' },
  '党参': { pinyin: 'dǎng shēn', nature: '平', taste: '甘', meridian: '脾、肺' },
  '太子参': { pinyin: 'tài zǐ shēn', nature: '平', taste: '甘、微苦', meridian: '脾、肺' },
  '黄芪': { pinyin: 'huáng qí', nature: '微温', taste: '甘', meridian: '脾、肺' },
  '白术': { pinyin: 'bái zhú', nature: '温', taste: '苦、甘', meridian: '脾、胃' },
  '山药': { pinyin: 'shān yào', nature: '平', taste: '甘', meridian: '脾、肺、肾' },
  '甘草': { pinyin: 'gān cǎo', nature: '平', taste: '甘', meridian: '心、肺、脾、胃' },
  '大枣': { pinyin: 'dà zǎo', nature: '温', taste: '甘', meridian: '脾、胃' },
  '沙棘': { pinyin: 'shā jí', nature: '温', taste: '酸、涩', meridian: '脾、胃、肺、心' },
  '饴糖': { pinyin: 'yí táng', nature: '温', taste: '甘', meridian: '脾、胃、肺' },
  '鹿茸': { pinyin: 'lù róng', nature: '温', taste: '甘、咸', meridian: '肾、肝' },
  '淫羊藿': { pinyin: 'yín yáng huò', nature: '温', taste: '辛、甘', meridian: '肝、肾' },
  '巴戟天': { pinyin: 'bā jǐ tiān', nature: '微温', taste: '辛、甘', meridian: '肾、肝' },
  '杜仲': { pinyin: 'dù zhòng', nature: '温', taste: '甘', meridian: '肝、肾' },
  '肉苁蓉': { pinyin: 'ròu cōng róng', nature: '温', taste: '甘、咸', meridian: '肾、大肠' },
  '菟丝子': { pinyin: 'tù sī zǐ', nature: '平', taste: '甘', meridian: '肝、肾、脾' },
  '蛤蚧': { pinyin: 'gé jiè', nature: '平', taste: '咸', meridian: '肺、肾' },
  '益智仁': { pinyin: 'yì zhì rén', nature: '温', taste: '辛', meridian: '肾、脾' },
  '冬虫夏草': { pinyin: 'dōng chóng xià cǎo', nature: '平', taste: '甘', meridian: '肾、肺' },
  '海马': { pinyin: 'hǎi mǎ', nature: '温', taste: '甘、咸', meridian: '肝、肾' },
  '当归': { pinyin: 'dāng guī', nature: '温', taste: '甘、辛', meridian: '肝、心、脾' },
  '乌贼骨': { pinyin: 'wū zéi gǔ', nature: '微温', taste: '咸、涩', meridian: '肝、肾' },
  '熟地黄': { pinyin: 'shú dì huáng', nature: '微温', taste: '甘', meridian: '肝、肾' },
  '白芍': { pinyin: 'bái sháo', nature: '微寒', taste: '苦、酸', meridian: '肝、脾' },
  '阿胶': { pinyin: 'ē jiāo', nature: '平', taste: '甘', meridian: '肺、肝、肾' },
  '何首乌': { pinyin: 'hé shǒu wū', nature: '微温', taste: '苦、甘、涩', meridian: '肝、肾' },
  '枸杞子': { pinyin: 'gǒu qǐ zǐ', nature: '平', taste: '甘', meridian: '肝、肾' },
  '麻黄根': { pinyin: 'má huáng gēn', nature: '平', taste: '甘、涩', meridian: '肺' },
  '浮小麦': { pinyin: 'fú xiǎo mài', nature: '凉', taste: '甘', meridian: '心' },
  '五味子': { pinyin: 'wǔ wèi zǐ', nature: '温', taste: '酸、甘', meridian: '肺、心、肾' },
  '乌梅': { pinyin: 'wū méi', nature: '平', taste: '酸、涩', meridian: '肝、脾、肺、大肠' },
  '罂粟壳': { pinyin: 'yīng sù ké', nature: '平', taste: '酸、涩', meridian: '肺、大肠、肾' },
  '诃子': { pinyin: 'hē zǐ', nature: '平', taste: '苦、酸、涩', meridian: '肺、大肠' },
  '石榴皮': { pinyin: 'shí liú pí', nature: '温', taste: '酸、涩', meridian: '大肠' },
  '赤石脂': { pinyin: 'chì shí zhī', nature: '温', taste: '甘、酸、涩', meridian: '大肠、胃' },
  '山茱萸': { pinyin: 'shān zhū yú', nature: '微温', taste: '酸', meridian: '肝、肾' },
  '桑螵蛸': { pinyin: 'sāng piāo xiāo', nature: '平', taste: '甘、咸', meridian: '肝、肾' },
  '海螵蛸': { pinyin: 'hǎi piāo xiāo', nature: '微温', taste: '咸、涩', meridian: '肝、肾' },
  '莲子': { pinyin: 'lián zǐ', nature: '平', taste: '甘、涩', meridian: '脾、肾、心' },
  '芡实': { pinyin: 'qiàn shí', nature: '平', taste: '甘、涩', meridian: '脾、肾' },
  '椿皮': { pinyin: 'chūn pí', nature: '寒', taste: '苦、涩', meridian: '大肠、肝' },
  '鸡冠花': { pinyin: 'jī guān huā', nature: '凉', taste: '甘、涩', meridian: '肝、大肠' },
  '常山': { pinyin: 'cháng shān', nature: '寒', taste: '苦、辛', meridian: '肺、肝' },
  '硫磺': { pinyin: 'liú huáng', nature: '温', taste: '酸', meridian: '肾、大肠' },
  '蛇床子': { pinyin: 'shé chuáng zǐ', nature: '温', taste: '苦、辛', meridian: '肾' },
  '蜂房': { pinyin: 'fēng fáng', nature: '平', taste: '甘', meridian: '胃、肝' }
}

async function importHerbs() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'caomuyoufang',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    charset: 'utf8mb4'
  })

  try {
    console.log('[MySQL] 连接成功')

    const herbs = parseHerbData(herbData)
    console.log(`[解析] 共解析 ${herbs.length} 味中药`)

    let inserted = 0
    let skipped = 0

    for (const herb of herbs) {
      // 检查是否已存在
      const [existing] = await connection.query(
        'SELECT id FROM herbs WHERE name = ?',
        [herb.name]
      )

      if (existing.length > 0) {
        console.log(`[跳过] ${herb.name} 已存在`)
        skipped++
        continue
      }

      // 获取补充信息
      const details = herbDetails[herb.name] || {}

      // 插入数据
      await connection.query(`
        INSERT INTO herbs (name, pinyin, category, nature, taste, meridian, indication)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        herb.name,
        details.pinyin || '',
        herb.category,
        details.nature || '',
        details.taste || '',
        details.meridian || '',
        herb.indication
      ])

      console.log(`[插入] ${herb.name} - ${herb.category}`)
      inserted++
    }

    console.log('\n========================================')
    console.log(`导入完成！`)
    console.log(`  成功插入: ${inserted} 条`)
    console.log(`  跳过已存在: ${skipped} 条`)
    console.log(`  总计: ${herbs.length} 条`)
    console.log('========================================')
  } catch (error) {
    console.error('[错误]', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

// 执行导入
importHerbs().catch(console.error)