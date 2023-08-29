import {Tag} from "antd";

// Collection Table Columns
const CollectionTableColumns = [
  {
    title: "Last Check",
    dataIndex: "lastCheckAt",
    key: "lastCheckAt",
    width: "15%",
  },
  {
    title: "MTCM",
    dataIndex: "id",
    key: "id",
    width: "15%",
    render: (item: any) => <Tag>MTCM-{item}</Tag>,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: "15%",
    render: (item: any) => <Tag color={item?.color}>{item?.message}</Tag>,
  },
];

export {
  CollectionTableColumns
}