# تفعيل لوحة إدارة موقع عمار قابيل

لوحة التحكم: `https://seosstm-hash.github.io/ammar-kabeel-portfolio/admin/`

## الحالة

واجهة اللوحة ومسار الحفظ جاهزان في هذا المستودع. تسجيل الدخول والنشر من اللوحة لا يعملان حتى إكمال الإعداد التالي. عند عدم وجود إعداد تظهر رسالة تفعيل بدل نموذج دخول وهمي. الموقع العام يظل منشورًا على GitHub Pages؛ لا تستخدم نسخة ChatGPT Sites القديمة.

## 1. مشروع Supabase وحساب المسؤول

1. أنشئ مشروع Supabase تملكه، أو اختر مشروعًا مخصصًا لهذا الموقع.
2. من Authentication فعّل Email/Password، وأوقف **Allow new users to sign up**. لا يوجد تسجيل عام في اللوحة.
3. أنشئ مستخدم المسؤول من صفحة Users، وحدد إيميلك وكلمة مرور قوية عبر Supabase مباشرة، وأكّد البريد. لا تكتب الباسورد في GitHub أو المحادثة.
4. انسخ **User UID** للحساب؛ هو المعرف الوحيد المسموح له في الخدمة، وليس مجرد أي مستخدم مسجل.
5. من إعدادات API انسخ Project URL والمفتاح **publishable** أو مفتاح **anon** القديم. لا تنسخ service_role أو secret إلى ملفات الموقع.

## 2. مفتاح GitHub للنشر

من إعدادات حساب GitHub أنشئ **Fine-grained personal access token**:

- Resource owner: `seosstm-hash`.
- Repository access: **Only select repositories**، ثم `ammar-kabeel-portfolio` فقط.
- Repository permissions: **Contents: Read and write** و**Actions: Read-only**.
- اختر تاريخ انتهاء مناسبًا وجدّده قبل انتهائه. لا يحتاج صلاحية تعديل Workflows.

استخدم PAT لحسابك، لا `GITHUB_TOKEN` الصادر عن GitHub Actions: الرفع باستخدام رمز Actions الافتراضي لا يشغّل Workflow push جديدًا عادةً. المفتاح يوضع كسر في Supabase فقط، ولا يصل إلى المتصفح.

## 3. أسرار الخدمة الخلفية

من **Edge Functions → Secrets** أضف:

| الاسم | القيمة |
| --- | --- |
| `GITHUB_TOKEN` | المفتاح المحدود بالمستودع السابق |
| `ADMIN_USER_ID` | UID الخاص بحساب المسؤول المؤكد |
| `ALLOWED_ORIGIN` | `https://seosstm-hash.github.io` |

توفر Supabase متغيرات `SUPABASE_URL` و`SUPABASE_ANON_KEY` تلقائيًا في المشروعات القديمة، أو `SUPABASE_PUBLISHABLE_KEYS` في الإعداد الحالي. إذا لم تتوفر مفاتيح عامة تلقائيًا، أضف المفتاح العام باسم `AUTH_PUBLISHABLE_KEY`.

## 4. نشر Edge Function

من نسخة مستودع `main` الحالية، باستخدام Supabase CLI مصادق لحسابك:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy portfolio-admin
```

الإعداد في `supabase/config.toml` يحدد ملف JavaScript. التحقق البوّابي القديم `verify_jwt` معطّل عمدًا لتوافق مفاتيح التوقيع المختلفة. **الخدمة ليست عامة الصلاحيات**: كودها يستعلم `/auth/v1/user` في كل طلب ثم يتحقق من UID والبريد المؤكد قبل قراءة المحتوى أو الكتابة إلى GitHub. لا تحذف هذا التحقق، ولا تستبدله بفك ترميز JWT فقط.

الدالة تستخدم الملفات المشتركة في `supabase/functions/_shared/` ومخطط التحقق الثابت `supabase/functions/_shared/schema.json`؛ انشرها من المستودع كاملًا وليس بنسخ ملف index وحده.

## 5. ربط اللوحة

عدّل `public/admin/config.json` بالقيم العامة فقط:

```json
{
  "supabaseUrl": "https://YOUR_PROJECT_REF.supabase.co",
  "publishableKey": "YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY"
}
```

ارفع إلى `main` وانتظر نجاح Workflow **Deploy portfolio to GitHub Pages**. لا تغيّر Workflow أو `basePath`. هذه البيانات عامة عمدًا، ولا تمنح صلاحية إدارة وحدها.

## 6. اختبار فعلي بعد التفعيل

- افتح `/ammar-kabeel-portfolio/admin/` وسجّل دخولك.
- جرّب كلمة مرور خاطئة: يجب رفضها. جرّب أي حساب آخر: يجب ألا يحصل على المحتوى أو صلاحية النشر.
- عدّل نصًا صغيرًا في النبذة واضغط **حفظ ونشر**. تحقق من Commit على `main` ثم نجاح النشر وظهور النص على الصفحة العامة.
- جرّب إضافة عمل بصورة صغيرة، ثم تحديث/حذف عمل أو عميل. كل حفظ ينشئ Commit واحدًا للمحتوى والصور الجديدة معًا.
- افتح جلستين وعدّل فيهما: يجب أن ترفض الثانية حفظ نسخة قديمة دون الكتابة فوق الأولى.
- أعد النص التجريبي واحفظ، ثم سجّل الخروج.

## استخدام اللوحة

الأقسام: الملف الشخصي والتواصل، النصوص العربية، النصوص الإنجليزية، الأعمال، العملاء، عنوان ووصف البحث. توجد إضافة وحذف وترتيب للقوائم ورفع PNG/JPG/WebP بحد أقصى 2 MB للصورة و6 MB إجمالي صور جديدة (حتى 12 صورة) لكل حفظ. لا تدعم هذه النسخة رفع PDF؛ يمكن اختيار مسار PDF موجود داخل `/portfolio/`.

الجلسة محفوظة في ذاكرة التبويب فقط؛ إعادة تحميل الصفحة تتطلب دخولًا جديدًا. التعديلات غير المحفوظة لا تُخزّن على الجهاز، وتظهر رسالة تنبيه عند محاولة مغادرة الصفحة. تغيير كلمة المرور واستردادها يتمان من Supabase حاليًا. لا توجد صفحة استرداد باسورد أو نظام دعوات داخل اللوحة.

حذف صورة من المحتوى يزيل ظهورها في الموقع، لكنه لا يحذف ملفها القديم أو تاريخها من GitHub. **أي محتوى أو صور تنشرها تصبح عامة** لأن المستودع والموقع عامان. يحتفظ GitHub بتاريخ التعديلات، ويمكن استعادة ملف المحتوى من Commit سابق عند الحاجة.

إذا فشل النشر، فالتعديلات قد تكون محفوظة بالفعل على GitHub. راجع رابط التفاصيل قبل إعادة الحفظ. تعديل البيانات لا يغيّر نتيجة Google فورًا ولا يزيل اسم حساب GitHub من عنوان الاستضافة.

## التحقق المحلي

```bash
npm ci
npm run test:admin
npx tsc --project tsconfig.pages.json --noEmit
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/ammar-kabeel-portfolio NEXT_PUBLIC_SITE_URL=https://seosstm-hash.github.io npx next build
```

اختبارات API تستخدم خدمات محاكاة؛ تؤكد التفويض، التحقق من المدخلات، منع التعارض، والكتابة الذرية. لا تغني عن اختبار الخدمة المنشورة بحساب Supabase فعلي.

## مراجع رسمية

- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Supabase user verification](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)
- [Deploy functions](https://supabase.com/docs/guides/functions/deploy)
- [GitHub token permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)
- [Triggering workflows from workflows](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow)
