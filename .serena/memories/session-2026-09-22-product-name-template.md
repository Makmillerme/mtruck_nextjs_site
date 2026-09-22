## Product name settings dialog (2026-09-22)

User feedback: modal must not create new catalog fields; only configure Name compose.

### Change
- Dialog UI: only separator + MemberOrderPicker (existing attributes) + save. Removed display-group name, writesProductName checkbox, create/add display group framing.
- New `saveProductNameTemplateAction` upserts single writer on folder (`key: product_name`, always `writesProductName: true`). Does not create AttributeDefinitions.
- Staff-allowed (`getStaffUser`). Schema: `saveProductNameTemplateSchema`.
- i18n: clarified hint + `productNameTemplate*` keys.
