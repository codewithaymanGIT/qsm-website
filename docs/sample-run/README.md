# Sample files for a full test run

Used by Appendix A of the project report (full run of the live site).

| File | Expected on upload |
|---|---|
| sample-drawing.pdf | Accepted (quote form, Drawing) |
| sample-part.step | Accepted (quote form, CAD file) |
| sample-flat.dxf | Accepted (quote form, CAD file) |
| sample-category-photo.jpg | Accepted (admin, Categories photo) |
| sample-customer-logo.png | Accepted (admin, Customers & mills) |
| fake-drawing.pdf | Refused: plain text renamed to .pdf |
| fake-part.step | Refused: executable header renamed to .step |

Oversize check: create a 21 MB file locally (`fallocate -l 21M big.pdf`) and try it as a drawing.
It must be refused with "Files must be 20 MB or smaller". Do not commit it.

Start every test entry with "TEST" and mark test enquiries as Spam afterwards.
