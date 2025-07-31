type NodeType = "DIRECTORY" | "PAGE";

export interface BaseMenuItem {
  name: string;
  isFolder: boolean;
  level: number;
  slug: string;
  icon: string;
  nodeType: NodeType;
}

export interface FolderMenuItem extends BaseMenuItem {
  isFolder: true;
  description: string;
  children: MenuItem[];
}

export interface LeafMenuItem extends BaseMenuItem {
  isFolder: false;
  resource: string;
  metaTitle: string;
  metaDescription: string;
}

export type MenuItem = FolderMenuItem | LeafMenuItem;

export type MenuItems = MenuItem[];
