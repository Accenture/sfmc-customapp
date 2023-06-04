import { arrayToTree } from "performant-array-to-tree";

const arr = [
	{
		id: 1,
		name: "Child",
		parentId: 0
	},
	{
		id: 2,
		name: "Child",
		parentId: 0
	},
	{
		id: 3,
		name: "SubChild",
		parentId: 1
	}
];

console.log(
	arrayToTree(arr, {
		id: "id",
		parentId: "parentId",
		childrenField: "items",
		dataField: null
	})
);
