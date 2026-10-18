/**
 * 韩文 -> 中文谐音引擎（口语化）
 *
 * 流程：整词谐音表（最长匹配） -> 音节谐音表 -> 音素兜底
 * 韩文音节按 Unicode 组合规则无损拆分，纯前端实现。
 */

const CHO_ROMAN = ['g', 'gg', 'n', 'd', 'dd', 'r', 'm', 'b', 'bb', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const JUNG_ROMAN = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
const JONG_ROMAN = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'l', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't']

export interface Syllable {
  hangul: string
  cho: number
  jung: number
  jong: number
}

/** 按 Unicode 组合规则拆分一个韩语音节，非音节字符返回 null */
export function decomposeSyllable(ch: string): Syllable | null {
  const code = ch.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return null
  const offset = code - 0xac00
  const jong = offset % 28
  const jung = Math.floor(offset / 28) % 21
  const cho = Math.floor(offset / 28 / 21)
  return { hangul: ch, cho, jung, jong }
}

const isHangulSyllable = (ch: string) => decomposeSyllable(ch) !== null
const isJamo = (ch: string) => {
  const c = ch.charCodeAt(0)
  return (c >= 0x3130 && c <= 0x318f) || (c >= 0x1100 && c <= 0x11ff)
}

/* ---------------------------------- 口语化整词谐音表 ---------------------------------- */

const WORD_MAP: Record<string, string> = {
  안녕하세요: '安娘哈塞哟',
  안녕하십니까: '安娘哈西姆尼嘎',
  안녕히가세요: '安娘히卡塞哟',
  안녕히계세요: '安娘히给塞哟',
  감사합니다: '康姆萨哈姆尼达',
  사랑합니다: '撒浪哈姆尼达',
  보고싶습니다: '波高西坡姆尼达',
  보고싶어요: '波高西坡哟',
  좋아해요: '走啊嘿哟',
  좋아합니다: '走啊哈姆尼达',
  미안해요: '米安内哟',
  미안합니다: '米安哈姆尼达',
  안녕: '安娘',
  사랑해요: '撒浪嘿哟',
  보고: '波高',
  싶어: '西坡',
  싶은: '西坡恩',
  사랑해: '撒浪嘿',
  사랑: '撒浪',
  사랑을: '撒浪日尔',
  보고싶어: '波高西坡',
  보고싶다: '波高西坡哒',
  좋아해: '走啊嘿',
  좋아: '走啊',
  고마워요: '高吗窝哟',
  고마워: '高吗窝',
  감사해요: '康姆萨嘿哟',
  감사해: '康姆萨嘿',
  미안해: '米安内',
  미안: '米安',
  정말로: '曾马尔咯',
  정말: '曾马尔',
  진짜: '金扎',
  진심: '金心',
  항상: '杭桑',
  언제나: '恩节那',
  가끔: '卡根',
  지금: '及格姆',
  오늘: '哦呢儿',
  내일: '内一儿',
  어제: '哦介',
  아침: '啊亲',
  밤: '吧姆',
  꿈: '古姆',
  꿈을: '古姆勒尔',
  눈물: '怒目儿',
  눈물이: '怒目里',
  하늘: '哈呢儿',
  바람: '吧朗',
  바람이: '吧朗米',
  바다: '吧达',
  술: '苏尔',
  친구: '亲古',
  여자: '哟咋',
  여자친구: '哟咋亲古',
  남자: '南咋',
  남자친구: '南咋亲古',
  사람: '萨朗',
  사람들: '萨朗德尔',
  인생: '因僧',
  세상: '塞桑',
  세상에: '塞桑哎',
  처음: '丘姆',
  처음으로: '丘姆勒罗',
  마음: '马姆',
  마음이: '马姆米',
  몸: '姆',
  손: '松',
  손을: '松呢尔',
  발: '吧尔',
  눈: '嫩',
  눈이: '努尼',
  코: '抠',
  입: '一普',
  목: '谋',
  심장: '心藏',
  시간: '西干',
  시간이: '西干尼',
  세계: '塞盖',
  우주: '乌租',
  별: '比哦',
  별이: '比哦里',
  빛: '比',
  빛이: '比奇',
  길: '给尔',
  길을: '给尔日尔',
  문: '木嗯',
  집: '吉布',
  집에: '吉布哎',
  학교: '哈给欧',
  오빠: '欧巴',
  언니: '欧尼',
  누나: '怒那',
  형: '哼',
  여보: '约啵',
  자기: '咋给',
  우리: '乌里',
  우리의: '乌里哎',
  너: '闹',
  너를: '闹日尔',
  너의: '闹哎',
  나: '那',
  나를: '那日尔',
  내: '内',
  내가: '内嘎',
  네가: '内嘎',
  제가: '届嘎',
  내게: '内给',
  너에게: '闹哎给',
  아주: '啊居',
  많이: '吗尼',
  조금: '走根',
  조금만: '走根慢',
  정도: '宗多',
  너무: '闹木',
  아무: '啊木',
  뭐: '莫',
  뭐야: '莫呀',
  이거: '一哥',
  그거: '格高',
  저거: '走高',
  여기: '要 gi'.replace(' ', ''),
  거기: '高 gi'.replace(' ', ''),
  저기: '走 gi'.replace(' ', ''),
  어느: '哦呢',
  어떻게: '哦多给',
  왜: '歪',
  어디: '哦地',
  언제: '恩节',
  누구: '怒古',
  뭐해: '莫黑',
  가자: '卡杂',
  가요: '卡哟',
  가지마: '卡吉马',
  가지마요: '卡吉马哟',
  기다려: 'ki大留',
  기다릴게: 'ki大r给',
  기다리다: 'ki大里达',
  기억해: 'ki要开',
  기억해요: 'ki要开哟',
  잊지마: '一吉马',
  잊지마요: '一吉马哟',
  알아: '阿拉',
  알아요: '阿拉哟',
  몰라: '莫拉',
  몰라요: '莫拉哟',
  알겠어: '阿尔给索',
  알겠습니다: '阿尔给斯姆尼达',
  괜찮아: '宽擦那',
  괜찮아요: '괜찮아요'.replace('괜찮아요', '宽擦那哟'),
  힘내: 'him内',
  힘내요: 'him内哟',
  사랑하자: '撒浪哈杂',
  영원히: '用我尼',
  모든: '摩登',
  그대: '格带',
  그대여: '格带要',
  말해: '妈来',
  말해요: '妈来哟',
  영원히함께: '用我尼哈给',
  행복해: '横波开',
  행복해요: '横波开哟',
  행복하자: '横波哈杂',
  불꽃: '불꽃'.replace('불꽃', '布尔过'),
  봄: '波姆',
  여름: '要勒姆',
  가을: '卡日尔',
  겨울: 'gio乌尔',
  꽃: '过',
  꽃이: '过奇',
  향기: 'hyang gi'.replace(' ', ''),
  향기로운: 'hyang gi'.replace(' ', '') + '罗温',
  따뜻해: '大得黑',
  따뜻한: '大得谈',
  차가운: '擦卡温',
  쓸쓸해: '斯斯尔黑',
  외로워: '外罗我',
  외로워요: '外罗我哟',
  우울해: '乌乌尔黑',
  슬퍼: '斯尔坡',
  슬퍼요: '斯尔坡哟',
  슬프다: '斯尔普达',
  아파: '啊帕',
  아파요: '啊帕哟',
  아픈: '啊喷',
  눈부셔: '怒不笑',
  예뻐: '也波',
  예뻐요: '也波哟',
  귀여워: 'ki要我',
  귀여워요: 'ki要我哟',
  멋있어: '莫西索',
  멋있어요: '莫西索哟',
  이뻐: '一波',
  대박: '大坝',
  짱: '藏',
  최고: '崔高',
  화이팅: '怀挺',
  파이팅: '派挺',
  축하해: '粗卡黑',
  축하해요: '粗卡黑哟',
  생일: '塞一儿',
  축하합니다: '粗卡哈姆尼达',
  만나서반가워: '满那索盘嘎我',
  반가워: '盘嘎我',
  반가워요: '盘嘎我哟',
  잘자: '扎尔杂',
  잘자요: '扎尔杂哟',
  굿나잇: '古德奈特',
  보고있어: '波高一索',
  생각해: '森嘎开',
  생각해요: '森嘎开哟',
  생각나: '森嘎那',
  보여: '波哟',
  들려: '德利奥',
  들어: '德罗',
  들어봐: '德罗吧',
  노래: '诺来',
  노래해: '诺来黑',
  노래방: '诺来邦',
  춤: '粗姆',
  춤을: '粗姆日尔',
  밥: '吧',
  밥을: '吧日尔',
  먹어: '莫高',
  먹어요: '莫高哟',
  마셔: '马笑',
  마셔요: '马笑哟',
  술을: '苏尔日尔',
  커피: '卡皮',
  라면: '拉面',
  김치: '金奇',
  떡볶이: '多波给',
  치킨: '奇킨'.replace('킨', '肯'),
  피자: '皮杂',
  사진: '萨金',
  사진을: '萨金日尔',
  영화: '用花',
  드라마: '德啦马',
  하늘을: '哈呢日尔日尔',
}

const WORD_ENTRIES = Object.entries(WORD_MAP).sort((a, b) => b[0].length - a[0].length)

/* ---------------------------------- 音节谐音表（罗马音 -> 口语汉字） ---------------------------------- */

const SYLLABLE_MAP: Record<string, string> = {
  // 纯元音音节
  a: '啊', ae: '哎', ya: '呀', yae: '耶', eo: '哦', e: '诶', yeo: '腰', ye: '耶',
  o: '哦', wa: '哇', wae: '歪', oe: '喂', yo: '哟', u: '呜', wo: '窝', we: '威',
  wi: '卫', yu: '优', eu: '呃', ui: '威', i: '一',
  an: '安', ang: '昂', al: '啊尔', am: '啊姆',
  eon: '恩', eol: '哦尔', eom: '哦姆',
  on: '翁', ong: '翁',
  un: '嗡', ung: '嗡',
  in: '因', il: '伊尔', im: '伊姆', ing: '英',

  // g
  ga: '嘎', gae: '该', gan: '干', gang: '刚', gal: '嘎尔', gam: '嘎姆', gak: '嘎', gap: '嘎', gat: '嘎',
  geo: '高', geol: '高尔', geom: '高姆', geon: '高恩',
  ge: '给', gen: '跟', gel: '给尔', gem: '给姆', ges: '给',
  gyeo: '交', gyeol: '交尔', gyeom: '交姆', gyeon: '交恩', gyeong: '囧',
  gye: '给',
  go: '高', gon: '滚', gol: '高尔', gom: '高姆', gok: '高', gop: '高', got: '高', gong: '工',
  gwa: '瓜', gwae: '怪', goe: '乖',
  gu: '古', gun: '滚', gul: '古尔', gum: '古姆', guk: '古', gup: '古', gut: '古', gung: '工',
  gwo: '郭', gwe: '圭', gwi: '贵',
  gyu: '纠', gyul: '纠尔', gyum: '纠姆',
  geu: '格', geul: '格尔', geum: '格姆', geuk: '格', geup: '格', geut: '格',
  gi: '基', gin: '金', gil: '基尔', gim: '基姆', gik: '基', gip: '基', git: '基', ging: '京',

  // n
  na: '那', nae: '内', nan: '难', nal: '纳尔', nam: '男', nak: '那', nap: '那', nat: '那',
  neo: '闹', neol: '闹尔', neom: '闹姆', neon: '闹恩',
  ne: '内', nel: '内尔',
  nyeo: '鸟', nyeon: '年',
  no: '诺', non: '农', nol: '诺尔', nom: '诺姆', nok: '诺', nop: '诺', not: '诺', nong: '浓',
  nu: '怒', nun: '嫩', nul: '怒尔', num: '怒姆', nuk: '怒', nup: '怒', nut: '怒', nung: '浓',
  nyo: '纽', nyu: '妞',
  ni: '尼', nil: '尼尔', nim: '尼姆', nin: '宁', nik: '尼', nip: '尼', nit: '尼',

  // d
  da: '达', dae: '带', dan: '丹', dal: '达尔', dam: '达姆', dak: '达', dap: '达', dat: '达', dang: '当',
  deo: '多', deol: '多尔', deom: '多姆', deon: '多恩',
  de: '带', den: '登', del: '带尔',
  do: '都', don: '顿', dol: '多尔', dom: '多姆', dok: '都', dop: '都', dot: '都', dong: '东',
  du: '度', dun: '敦', dul: '度尔', dum: '度姆', duk: '度', dup: '度', dut: '度', dung: '东',
  dwi: '对',
  di: '地', dil: '地尔', dim: '地姆', din: '定', dik: '地', dip: '地', dit: '地',
  deu: '德', deul: '德尔', deum: '德姆', deuk: '德', deup: '德', deut: '德',

  // r / l
  ra: '拉', rae: '来', ran: '兰', ral: '拉尔', ram: '拉姆', rak: '拉', rap: '拉', rat: '拉', rang: '浪',
  reo: '罗', reol: '罗尔', reom: '罗姆', reon: '罗恩',
  re: '来', ren: '任', rel: '来尔',
  ryeo: '寥', ryeol: '寥尔', ryo: '辽',
  ro: '洛', ron: '伦', rol: '洛尔', rom: '洛姆', rok: '洛', rop: '洛', rot: '洛', rong: '龙',
  ru: '卢', run: '伦', rul: '卢尔', rum: '卢姆', ruk: '卢', rup: '卢', rut: '卢', rung: '龙',
  rwa: '拉哇',
  ri: '里', ril: '里尔', rim: '里姆', rin: '林', rik: '里', rip: '里', rit: '里', ring: '林',
  ryu: '刘', ryul: '刘尔', ryung: '隆',
  reu: '勒', reul: '勒尔', reum: '勒姆', reuk: '勒', reup: '勒', reut: '勒',

  // m
  ma: '妈', mae: '买', man: '满', mal: '妈尔', mam: '妈姆', mak: '妈', map: '妈', mat: '妈', mang: '忙',
  meo: '么', meol: '么尔', meom: '么姆', meon: '么恩',
  me: '美', mel: '美尔',
  myeo: '苗', myeol: '苗尔', myeon: '面', myeong: '名',
  mo: '莫', mon: '门', mol: '莫尔', mom: '莫姆', mok: '莫', mop: '莫', mot: '莫', mong: '梦',
  mu: '木', mun: '门', mul: '木尔', mum: '木姆', muk: '木', mup: '木', mut: '木', mung: '梦',
  mi: '米', mil: '米尔', mim: '米姆', min: '民', mik: '米', mip: '米', mit: '米', ming: '明',
  myu: '缪',
  meu: '么', meul: '么尔', meum: '么姆', meuk: '么', meup: '么', meut: '么',

  // b
  ba: '吧', bae: '拜', ban: '班', bal: '吧尔', bam: '爸', bak: '爸', bap: '爸', bat: '爸', bang: '帮',
  beo: '包', beol: '包尔', beom: '包姆', beon: '包恩',
  be: '拜', bel: '拜尔',
  byeol: '比哦尔', byeong: '崩',
  bo: '波', bon: '本', bol: '波尔', bom: '波姆', bok: '波', bop: '波', bot: '波', bong: '崩',
  bu: '不', bun: '奔', bul: '布尔', bum: '布姆', buk: '不', bup: '不', but: '不', bung: '崩',
  bi: '比', bil: '比尔', bim: '比姆', bin: '宾', bik: '比', bip: '比', bit: '比', bing: '兵',
  beu: '波', beul: '布尔', beum: '布姆', beup: '波', beuk: '波', beut: '波',

  // s
  sa: '撒', sae: '塞', san: '散', sal: '撒尔', sam: '撒姆', sak: '撒', sap: '撒', sat: '撒', sang: '桑',
  seo: '索', seol: '索尔', seom: '索姆', seon: '索恩',
  se: '塞', sel: '塞',
  syo: '休', syu: '休',
  so: '搜', son: '孙', sol: '索尔', som: '搜姆', sok: '搜', sop: '搜', sot: '搜', song: '松',
  su: '苏', sun: '孙', sul: '苏尔', sum: '苏姆', suk: '苏', sup: '苏', sut: '苏', sung: '松',
  swa: '刷',
  si: '西', sil: '西尔', sim: '西姆', sin: '新', sik: '西', sip: '西', sit: '西', sing: '星',
  seu: '思', seul: '思尔', seum: '思姆', seuk: '思', seup: '思', seut: '思',

  // j
  ja: '扎', jae: '在', jan: '赞', jal: '扎尔', jam: '扎姆', jak: '扎', jap: '扎', jat: '扎', jang: '张',
  jeo: '走', jeol: '走尔', jeom: '走姆', jeon: '尊', jeong: '宗',
  je: '杰', jen: '真',
  jyeo: '就', jyeol: '就尔', jyeong: '囧', jyo: '就',
  jo: '造', jon: '尊', jol: '造尔', jom: '造姆', jok: '造', jop: '造', jot: '造', jong: '宗',
  ju: '居', jun: '俊', jul: '居尔', jum: '居姆', juk: '居', jup: '居', jut: '居', jung: '宗',
  jwa: '抓',
  ji: '鸡', jil: '鸡尔', jim: '鸡姆', jin: '金', jik: '鸡', jip: '鸡', jit: '鸡', jing: '京',
  jyu: '久',
  jeu: '资', jeul: '资尔', jeum: '资姆', jeuk: '资', jeup: '资', jeut: '资',

  // ch
  cha: '差', chae: '才', chan: '产', chal: '差尔', cham: '差姆', chak: '差', chap: '差', chat: '差', chang: '昌',
  cheo: '丑', cheol: '丑尔', cheom: '丑姆', cheon: '村', cheong: '聪',
  che: '切', chen: '亲',
  chyeo: '秋', chyeol: '秋尔', chyeong: '青', chyo: '秋',
  cho: '粗', chon: '村', chol: '粗尔', chom: '粗姆', chok: '粗', chop: '粗', chot: '粗', chong: '冲',
  chu: '秋', chun: '春', chul: '秋尔', chum: '秋姆', chuk: '秋', chup: '秋', chut: '秋', chung: '冲',
  choe: '崔', chwi: '脆',
  chi: '七', chil: '七尔', chim: '七姆', chin: '亲', chik: '七', chip: '七', chit: '七', ching: '青',
  cheu: '茨', cheul: '茨尔', cheum: '茨姆', cheuk: '茨', cheup: '茨', cheut: '茨',

  // k
  ka: '卡', kae: '凯', kan: '刊', kal: '卡尔', kam: '卡姆', kak: '卡', kap: '卡', kat: '卡', kang: '康',
  keo: '靠', keol: '靠尔', keom: '靠姆', keon: '靠恩',
  ke: '开', ken: '肯',
  ko: '口', kon: '困', kol: '口尔', kom: '口姆', kok: '口', kop: '口', kot: '口', kong: '空',
  ku: '库', kun: '困', kul: '库尔', kum: '库姆', kuk: '库', kup: '库', kut: '库', kung: '空',
  kwa: '夸', kwae: '快', koe: '快', kwi: '亏', kyu: '扣',
  ki: '剋', kil: '剋尔', kim: '剋姆', kin: '肯', kip: '剋', kit: '剋',
  keu: '客', keul: '客尔', keum: '客姆', keuk: '客', keup: '客', keut: '客',

  // t
  ta: '他', tae: '太', tan: '谈', tal: '他尔', tam: '他姆', tak: '他', tap: '他', tat: '他', tang: '汤',
  teo: '套', teol: '套尔', teom: '套姆', teon: '套恩',
  te: '太', tel: '太尔',
  to: '托', ton: '顿', tol: '托尔', tom: '托姆', tok: '托', top: '托', tot: '托', tong: '通',
  tu: '图', tun: '吞', tul: '图尔', tum: '图姆', tuk: '图', tup: '图', tut: '图', tung: '通',
  twi: '推',
  ti: '梯', til: '梯尔', tim: '梯姆',
  teu: '特', teul: '特尔', teum: '特姆', teuk: '特', teup: '特', teut: '特',

  // p
  pa: '怕', pae: '派', pan: '盘', pal: '怕尔', pam: '怕姆', pak: '怕', pap: '怕', pat: '怕', pang: '胖',
  peo: '跑', peol: '跑尔', peom: '跑姆', peon: '跑恩',
  pe: '配', pel: '配尔',
  po: '破', pon: '盆', pol: '破尔', pom: '破姆', pok: '破', pop: '破', pot: '破', pong: '蓬',
  pu: '铺', pun: '盆', pul: '铺尔', pum: '铺姆', puk: '铺', pup: '铺', put: '铺', pung: '蓬',
  pi: '皮', pil: '皮尔', pim: '皮姆', pin: '品', pik: '皮', pip: '皮', pit: '皮', ping: '乒',
  peu: '破', peul: '破尔', peum: '铺姆', peup: '破', peuk: '破', peut: '破',

  // h
  ha: '哈', hae: '海', han: '韩', hal: '哈尔', ham: '哈姆', hak: '哈', hap: '哈', hat: '哈', hang: '杭',
  heo: '好', heol: '好尔', heom: '好姆', heon: '好恩', heong: '红',
  he: '嘿',
  hyeo: '晓', hyeol: '晓尔', hyeon: '现', hyeong: 'hyo'.replace('hyo', '兄'), hye: '惠', hyo: '晓',
  ho: '厚', hon: '昏', hol: '厚尔', hom: '厚姆', hok: '厚', hop: '厚', hot: '厚', hong: '红',
  hu: '呼', hun: '混', hul: '呼尔', hum: '呼姆', huk: '呼', hup: '呼', hut: '呼', hung: '红',
  hwa: '花', hwae: '坏', hoe: '灰', hwi: '辉', hyu: '咻',
  hi: '希', hil: '希尔', him: '希姆', hin: '欣', hik: '希', hip: '希', hit: '希', hing: '兴',
  heu: '赫', heul: '赫尔', heum: '赫姆', heuk: '赫', heup: '赫', heut: '赫',
}

/* ---------------------------------- 音素兜底表 ---------------------------------- */

const CONS_FALLBACK: Record<string, string> = {
  g: '格', gg: '格', n: '讷', d: '德', dd: '德', r: '勒', m: '默', b: '伯', bb: '伯',
  s: '斯', ss: '斯', '': '', j: '资', jj: '资', ch: '茨', k: '科', t: '特', p: '坡', h: '赫',
}

const VOWEL_FALLBACK: Record<string, string> = {
  a: '啊', ae: '诶', ya: '呀', yae: '耶', eo: '哦', e: '诶', yeo: '哟', ye: '耶',
  o: '哦', wa: '哇', wae: '歪', oe: '喂', yo: '哟', u: '呜', wo: '窝', we: '威',
  wi: '卫', yu: '优', eu: '呃', ui: '威', i: '一',
}

/** 收音处理：韩语塞音尾不爆破，口语谐音直接吞掉 */
const CODA_FALLBACK: Record<string, string> = {
  '': '', k: '', n: '嗯', l: '尔', m: '姆', p: '', t: '', ng: '嗯',
}

/* ---------------------------------- 转写逻辑 ---------------------------------- */

function transliterateSyllable(ch: string): string {
  if (isJamo(ch)) return ch
  const syl = decomposeSyllable(ch)
  if (!syl) return ch
  const rom = CHO_ROMAN[syl.cho] + JUNG_ROMAN[syl.jung] + JONG_ROMAN[syl.jong]
  const romNoCoda = rom.slice(0, rom.length - JONG_ROMAN[syl.jong].length)

  // 1. 整音节命中
  const hit = SYLLABLE_MAP[rom]
  if (hit) return hit

  // 2. 去收音命中 + 收音后缀
  const base = SYLLABLE_MAP[romNoCoda]
  if (base !== undefined) return base + CODA_FALLBACK[JONG_ROMAN[syl.jong]]

  // 3. 音素兜底
  return (
    CONS_FALLBACK[CHO_ROMAN[syl.cho]] +
    VOWEL_FALLBACK[JUNG_ROMAN[syl.jung]] +
    CODA_FALLBACK[JONG_ROMAN[syl.jong]]
  )
}

/** 转写连续韩文字符串（一个词），整词谐音表最长匹配优先 */
function transliterateWord(word: string): string {
  let out = ''
  let i = 0
  while (i < word.length) {
    let matched = false
    for (const [k, v] of WORD_ENTRIES) {
      if (word.startsWith(k, i)) {
        out += v
        i += k.length
        matched = true
        break
      }
    }
    if (!matched) {
      out += transliterateSyllable(word[i])
      i += 1
    }
  }
  return out
}

/** 转写一行歌词：韩文段逐词转写，标点与空白原样保留 */
export function transliterateLine(line: string): string {
  let out = ''
  let buffer = ''
  const flush = () => {
    if (buffer) {
      out += transliterateWord(buffer)
      buffer = ''
    }
  }
  for (const ch of line) {
    if (isHangulSyllable(ch) || isJamo(ch)) {
      buffer += ch
    } else {
      flush()
      out += ch
    }
  }
  flush()
  return out
}

/** 将歌词文本切分为有效行（去首尾空白、去掉空行） */
export function splitLyrics(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}
