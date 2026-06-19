const router =
require("express")
.Router();

const f =
require(
"../controllers/facturaController"
);

router.post(
"/",
f.crear
);

module.exports=
router;