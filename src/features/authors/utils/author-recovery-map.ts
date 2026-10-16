/**
 * Historical author knowledge base mapped to catalog book titles.
 * Used by the author edit modal and authors directory to suggest and restore
 * the accurate classical or published author metadata when author records are desynchronized.
 */

export interface AuthorSuggestion {
  name: string;
  nationality: string;
  bio: string;
}

const HISTORICAL_AUTHOR_MAP: Record<string, AuthorSuggestion> = {
  'sahih muslim': {
    name: 'Imam Muslim ibn al-Hajjaj',
    nationality: 'Persian',
    bio: 'Scholar of Hadith, compiler of Sahih Muslim, one of the six most authentic Hadith collections in Sunni Islam.',
  },
  'ihya ulum al-din': {
    name: 'الإمام أبو حامد محمد بن محمد الغزالي',
    nationality: 'Persian',
    bio: 'Renowned polymath, philosopher, jurist, and mystic of Islam, author of the monumental Ihya Ulum al-Din (The Revival of the Religious Sciences).',
  },
  'a return to purity in creed': {
    name: 'الإمام أبو حامد محمد بن محمد الغزالي',
    nationality: 'Persian',
    bio: 'Renowned polymath, philosopher, jurist, and mystic of Islam, author of foundational theological and spiritual treaties.',
  },
  'منهاج العابدين': {
    name: 'الإمام أبو حامد محمد بن محمد الغزالي',
    nationality: 'Persian',
    bio: 'Classical treatise on spiritual journey and moral conduct by Imam Abu Hamid al-Ghazali.',
  },
  'المغني': {
    name: 'موفق الدين عبد الله بن أحمد بن قدامة المقدسي',
    nationality: 'Syrian',
    bio: 'Distinguished Islamic scholar, jurist, and theologian of the Hanbali school of jurisprudence, compiler of Al-Mughni.',
  },
  'في ظلال القرآن': {
    name: 'سيد قطب',
    nationality: 'Egyptian',
    bio: 'Egyptian author, educator, and Islamic theorist, best known for his comprehensive Quranic commentary Fi Zilal al-Qur\'an.',
  },
  'سير أعلام النبلاء': {
    name: 'الإمام الذهبي',
    nationality: 'Syrian',
    bio: 'Syrian Islamic scholar, historian, and Hadith master, author of the 23-volume biographical encyclopedia Siyar A\'lam al-Nubala.',
  },
  'الرحيق المختوم': {
    name: 'صفي الرحمن المباركفوري',
    nationality: 'Indian',
    bio: 'Indian Islamic scholar and historian, author of Ar-Raheeq Al-Makhtum (The Sealed Nectar), winner of the Muslim World League international award.',
  },
  'the seald nectar': {
    name: 'Safiur Rahman Mubarakpuri',
    nationality: 'Indian',
    bio: 'Indian Islamic scholar and historian, author of Ar-Raheeq Al-Makhtum (The Sealed Nectar), winner of the Muslim World League international award.',
  },
  'التعليق على مواضع من شرح العقيدة الطحاوية': {
    name: 'الشيخ محمد بن صالح العثيمين',
    nationality: 'Saudi Arabian',
    bio: 'Prominent Islamic scholar, theologian, and jurist of the contemporary era.',
  },
  'dune': {
    name: 'Frank Herbert',
    nationality: 'American',
    bio: 'American science fiction author best known for the 1965 masterpiece novel Dune and its sequels.',
  },
  'ስለ ኢስላም አጭር ማብራሪያ': {
    name: 'Mohammed Ayub',
    nationality: 'Ethiopian',
    bio: 'Ethiopian author and educator, translator of foundational Islamic literature into Amharic.',
  },
  'زاد المعاد': {
    name: 'ابن قيم الجوزية',
    nationality: 'Syrian',
    bio: 'Eminent Islamic scholar, theologian, and prolific author, foremost disciple of Ibn Taymiyyah, author of Zad al-Ma\'ad.',
  },
  'الأذكار': {
    name: 'الإمام النووي',
    nationality: 'Syrian',
    bio: 'Distinguished Islamic jurist and Hadith scholar of the Shafi\'i school, author of Riyadh as-Salihin and Al-Adhkar.',
  },
  'riyadu saliheen': {
    name: 'الإمام النووي',
    nationality: 'Syrian',
    bio: 'Distinguished Islamic jurist and Hadith scholar of the Shafi\'i school, compiler of the acclaimed Hadith compendium Riyadh as-Salihin.',
  },
  'ibn taymiyyah': {
    name: 'شيخ الإسلام ابن تيمية',
    nationality: 'Syrian',
    bio: 'Influential Islamic scholar, theologian, and polymath of the Hanbali tradition, one of the most profound classical theologians.',
  },
  'منهاج السنة': {
    name: 'شيخ الإسلام ابن تيمية',
    nationality: 'Syrian',
    bio: 'Influential Islamic scholar, theologian, and polymath of the Hanbali tradition.',
  },
  'الصراط المستقيم': {
    name: 'شيخ الإسلام ابن تيمية',
    nationality: 'Syrian',
    bio: 'Influential Islamic scholar, theologian, and polymath of the Hanbali tradition.',
  },
  'the book of iman': {
    name: 'شيخ الإسلام ابن تيمية',
    nationality: 'Syrian',
    bio: 'Influential Islamic scholar, theologian, and polymath of the Hanbali tradition.',
  },
  'التعرف لمذهب أهل التصوف': {
    name: 'أبو بكر الكلاباذي',
    nationality: 'Persian',
    bio: 'Classical Hanafi jurist and author of Kitab at-Ta\'arruf, one of the earliest authoritative works on Islamic spirituality.',
  },
  'مختصر منهاج القاصدين': {
    name: 'ابن قدامة المقدسي',
    nationality: 'Syrian',
    bio: 'Distinguished scholar, jurist, and theologian of the Hanbali school.',
  },
  'being muslim': {
    name: 'Asad Tarsin',
    nationality: 'American',
    bio: 'American author and educator, creator of Being Muslim: A Practical Guide to foundational Islamic faith and practice.',
  },
  'moby-dick': {
    name: 'Herman Melville',
    nationality: 'American',
    bio: 'American novelist, short story writer, and poet of the American Renaissance, author of Moby-Dick.',
  },
  'አል-ኡሱል አስ-ሰላሰህ': {
    name: 'الشيخ محمد بن عبد الوهاب',
    nationality: 'Saudi Arabian',
    bio: 'Theologian and Islamic reformer, author of Al-Usool Ath-Thalaatha (The Three Fundamental Principles).',
  },
  'السيرة النبوية': {
    name: 'ابن هشام',
    nationality: 'Egyptian',
    bio: 'Classical Islamic historian and biographer, compiler of the authoritative Sirat Ibn Hisham.',
  },
};

/**
 * Finds a matching author suggestion based on linked book titles.
 */
export function getAuthorSuggestionByBookNames(bookNames: string[]): AuthorSuggestion | null {
  for (const rawName of bookNames) {
    const normalized = rawName.trim().toLowerCase();
    for (const [key, suggestion] of Object.entries(HISTORICAL_AUTHOR_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return suggestion;
      }
    }
  }
  return null;
}
