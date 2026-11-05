import React from 'react';

const lessons = 'https://tajweed.quranpedia.net/lessons/show/content/';
// Hand-authored pilot, explicitly limited to 2:22. Not generated from color classes.
const examples = [
    { name: 'همزة الوصل', color: '#64748b', colorName: 'رمادي', place: 'ٱلْأَرْضَ · ٱلسَّمَاءَ · ٱلسَّمَاءِ · ٱلثَّمَرَاتِ', why: 'الهمزة في بداية «أل» همزة وصل؛ وهي غير الهمزة الأصلية بعد اللام في «الأرض».', how: 'تُترك همزة الوصل عند وصل الكلمة بما قبلها، وتُنطق مفتوحة عند الابتداء بهذه الكلمات. تحديد هذه المواضع من بيانات التلوين، وليس من هوامش الكتاب.', source: 'https://quranpedia.net/tajweed-rules/hamzat-wasl' },
    { name: 'الإخفاء الحقيقي', color: '#15803d', colorName: 'أخضر', place: 'أَنْزَلَ · أَنْدَادًا · وَأَنْتُمْ · مَاءً فَأَخْرَجَ', why: 'بعد النون الساكنة جاءت الزاي أو الدال أو التاء، وبعد تنوين «ماءً» جاءت الفاء؛ وهي من حروف الإخفاء.', how: 'تُخفى النون أو التنوين مع غنة بمقدار حركتين. موضع التنوين هنا عند وصل الكلمتين.', source: lessons + '23' },
    { name: 'إدغام بغنة', color: '#15803d', colorName: 'أخضر', place: 'فِرَاشًا وَالسَّمَاءَ · بِنَاءً وَأَنْزَلَ · أَنْدَادًا وَأَنْتُمْ', why: 'التنوين في نهاية الكلمة يتبعه حرف الواو عند الوصل.', how: 'يُدغم التنوين في الواو مع إبقاء الغنة بمقدار حركتين؛ لا يطبق هذا الوصل عند الوقف على الكلمة الأولى.', source: lessons + '23' },
    { name: 'إدغام بغير غنة', color: '#7c3aed', colorName: 'بنفسجي', place: 'رِزْقًا لَكُمْ', why: 'جاءت اللام بعد التنوين.', how: 'عند الوصل يدخل التنوين في اللام دون غنة للتنوين.', source: lessons + '23' },
    { name: 'المد الواجب المتصل', color: '#be123c', colorName: 'أحمر قرمزي', place: 'السَّمَاءَ · بِنَاءً · السَّمَاءِ · مَاءً', why: 'جاءت الهمزة بعد حرف المد في الكلمة نفسها.', how: 'يمد أربع أو خمس حركات في حفص من طريق الشاطبية عند الوصل، مع الالتزام بوجه القراءة المتبع.', source: lessons + '27' },
    { name: 'القلقلة الصغرى', color: '#0369a1', colorName: 'أزرق', place: 'تَجْعَلُوا — الجيم الساكنة', why: 'الجيم من حروف القلقلة، وقد جاءت ساكنة في وسط الكلمة.', how: 'يُسمع للجيم صوت القلقلة دون إضافة فتحة أو ضمة أو كسرة إليها.', source: 'https://tajweed.quranpedia.net/term/show/78' },
    { name: 'مد الصلة الصغرى', color: '#c2410c', colorName: 'برتقالي داكن', place: 'بِهِ مِنَ — هاء «به»', why: 'هاء الضمير بين متحركين، وليس بعدها همزة.', how: 'عند الوصل تُوصل الهاء بياء لفظية بمقدار حركتين. لا تكون هذه الصلة عند الوقف على «به».', source: lessons + '27' },
];

export default function TajweedBaqarahSample() {
    return <section dir="rtl" lang="ar" aria-label="شرح مواضع التجويد في البقرة ٢٢" style={{ marginBottom: 24 }}>
        <h3 className="font-bold text-lg">أين الحكم؟ ولماذا؟ وكيف يُنطق؟</h3>
        <p className="text-sm leading-loose my-3">عينة تعليمية لمواضع مختارة من البقرة ٢٢، برواية حفص. الشرح صياغة مختصرة للقواعد، وليس نقلًا حرفيًا من الكتاب ولا حصرًا لجميع أحكام الآية.</p>
        {examples.map(item => <article key={item.name} style={{ background: '#fffdf7', color: '#20252c', border: '1px solid #ddd4c5', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <span aria-hidden="true" style={{ background: item.color, width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
                <h4 className="font-bold">{item.name}</h4><span className="text-sm">{item.colorName}</span>
            </div>
            <p style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: 25, lineHeight: 1.9, margin: '10px 0' }}>{item.place}</p>
            <p className="leading-loose"><strong>السبب: </strong>{item.why}</p>
            <p className="leading-loose"><strong>الأداء: </strong>{item.how}</p>
            <a href={item.source} target="_blank" rel="noopener noreferrer" className="underline text-sm">مرجع شرح القاعدة</a>
        </article>)}
        <p className="text-sm leading-loose">مرجع مطابقة المواضع: <a href="https://quranpedia.net/book/2038" target="_blank" rel="noopener noreferrer" className="underline">المصحف المبين لأحكام التجويد</a>، صفحة المصحف ٤ (صفحة ١١ في الملف). ألوان العرض تتبع مفتاح التطبيق وبيانات Quran.com، وليست ألوان هوامش الكتاب.</p>
    </section>;
}
