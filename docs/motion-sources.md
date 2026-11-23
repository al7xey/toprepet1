# Motion used in TopRepet

The motion layer adapts interaction patterns from [DesignBookmark Motion](https://designbookmark.com/motion) to the existing TopRepet components. The site keeps its current layout and controls; motion is tied to scrolling, focus, selection, loading, and navigation. Source snippets are not copied wholesale: spring behavior and timing are adapted to the app's controls, accessibility needs, and reduced-motion setting.

Source study and product mapping:

1. [Tab Pill](https://designbookmark.com/motion-src/tab-pill/index.html) — spring-following active tab underline.
2. [Segmented Control](https://designbookmark.com/motion-src/segmented-control/index.html) — paired spring edges on tabs.
3. [Toggle Switch](https://designbookmark.com/motion-src/toggle-switch/index.html) — elastic knob travel without changing the control's footprint.
4. [Step Progress](https://designbookmark.com/motion-src/step-progress/index.html) — spring progress fill.
5. [Checkbox List](https://designbookmark.com/motion-src/checkbox-list/index.html) — small checkmark settle and fill.
6. [Spring Dropdown](https://designbookmark.com/motion-src/spring-dropdown/index.html) — menu arrival.
7. [Dynamic Menu](https://designbookmark.com/motion-src/dynamic-menu/index.html) — burger icon morph and staggered menu rows.
8. [Morph Island](https://designbookmark.com/motion-src/morph-island/index.html) — modal entrance.
9. [Loading Success](https://designbookmark.com/motion-src/loading-success/index.html) — toast and asynchronous button feedback.
10. [Expand Card](https://designbookmark.com/motion-src/expand-card/index.html) — FAQ reveal and plus-to-close rotation.
11. [Profile Card](https://designbookmark.com/motion-src/profile-card/index.html) — tutor-card reveal and photo hover treatment.
12. [Parallax Ticket](https://designbookmark.com/motion-src/parallax-ticket/index.html) — restrained pointer parallax on tutor portraits.
13. [Stat Card](https://designbookmark.com/motion-src/stat-card/index.html) — staggered statistics appearance on scroll.
14. [Springy Input](https://designbookmark.com/motion-src/springy-input/index.html) — focused form field response.
15. [OTP Code](https://designbookmark.com/motion-src/otp-code/index.html) — focused verification-code field.
16. [File Drop](https://designbookmark.com/motion-src/file-drop/index.html) — upload control hover and drag target feedback.
17. [Star Rating](https://designbookmark.com/motion-src/star-rating/index.html) — selected rating star pulse.
18. [Number Stepper](https://designbookmark.com/motion-src/number-stepper/index.html) — selected day response.
19. [Range Slider](https://designbookmark.com/motion-src/range-slider/index.html) — selected lesson-time response.
20. [Jelly Slider](https://designbookmark.com/motion-src/jelly-slider/index.html) — booking schedule selection.
21. [Pagination Dots](https://designbookmark.com/motion-src/pagination-dots/index.html) — calendar month transition.
22. [Streaming Reply](https://designbookmark.com/motion-src/streaming-reply/index.html) — message arrival.
23. [Prompt Box](https://designbookmark.com/motion-src/prompt-box/index.html) — focused chat composer.
24. [Roll Links](https://designbookmark.com/motion-src/roll-links/index.html) — navigation hover text accent.
25. [Icon Response](https://designbookmark.com/motion-src/icon-response/index.html) — compact icon response on hover.
26. [Tag Input](https://designbookmark.com/motion-src/tag-input/index.html) — subject and preference chip selection.
27. [Morph Tooltip](https://designbookmark.com/motion-src/morph-tooltip/index.html) — smooth feedback surfaces.
28. [Glass Lens](https://designbookmark.com/motion-src/glass-lens/index.html) — focus ring on the glass search field.

Motion is centralized in `src/new-design/ui/motion.tsx` and `src/new-design/ui/liquid-motion.css`. The shared spring equations live in `motion-spring.ts`. Reduced-motion preferences disable decorative motion; controls retain the same size and remain usable without animation.
