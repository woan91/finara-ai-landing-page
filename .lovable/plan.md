## Refine "Save My Plan" Modal

Polish the existing `SavePlanModal` with updated copy, a more premium fintech aesthetic, and emotionally supportive tone. Frontend only — no auth wiring.

### Copy updates (both EN + 中文 in `i18n.tsx`)
- **Title**: "Save your financial journey" / "保存你的财务旅程"
- **Subtitle**: "Create a free account to save your AI financial plan and continue tracking your progress anytime." / "创建免费账户，保存你的 AI 财务计划，随时继续追踪你的进度。"
- **Buttons**: "Continue with Google" / "Continue with Email" (already close — confirm wording)

### Visual refinements (`SavePlanModal.tsx`)
- Soft gradient header glow (radial primary → transparent) behind the title for premium feel
- Replace plain Sparkles eyebrow with a small gradient badge ("Finara AI · Free")
- Both auth buttons styled equally as primary-weight pills:
  - Google: white/card surface, subtle border, soft shadow
  - Email: gradient fill with `shadow-glow`
- Show both buttons side-by-side on desktop, stacked on mobile — no "show email form on click" hidden state; email form slides in below when chosen
- Add a subtle "or" divider between the two
- Reassuring micro-copy under buttons: lock icon + "Bank-grade encryption · We'll never share your data"
- Smoother enter animation (scale + fade), refined backdrop blur
- Bottom-sheet on mobile (<sm), centered card on desktop — already in place, polish radius/padding
- Success state: gradient check badge instead of flat green chip

### Files touched
- `src/components/finara/i18n.tsx` — update `saveModal` strings (en + zh)
- `src/components/finara/SavePlanModal.tsx` — layout, gradient, button styling, animation
- `src/styles.css` — only if a new gradient/shadow token is needed (e.g. `--gradient-modal-glow`)

### Out of scope
- Real Google OAuth or email magic-link backend
- Calculator, Hero, or other section changes
- New routes
