import "@lwc/synthetic-shadow";
import { createElement } from "lwc";

import FooApp from "foo/app";

document.querySelector("#main").appendChild(createElement("foo-app", { is: FooApp }));
