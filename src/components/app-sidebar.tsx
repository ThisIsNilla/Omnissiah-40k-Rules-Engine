import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Book, FileText } from "lucide-react"
import fs from "fs"
import path from "path"

export function AppSidebar() {
  let rulebooks: string[] = [];
  try {
    const rulebooksDir = path.join(process.cwd(), 'rulebooks');
    if (fs.existsSync(rulebooksDir)) {
      rulebooks = fs.readdirSync(rulebooksDir).filter(f => f.endsWith('.pdf'));
    }
  } catch (error) {
    console.error("Failed to read rulebooks directory", error);
  }

  // Formatting function to make filenames look nice
  const formatName = (name: string) => {
    return name.replace('.pdf', '')
               .replace(/[-_]/g, ' ')
               .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Book className="w-5 h-5" />
          Omnissiah
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
          Tactical Rules Engine
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">Ingested Rulebooks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rulebooks.length === 0 ? (
                <SidebarMenuItem>
                  <span className="text-sm text-muted-foreground px-2">No rulebooks found.</span>
                </SidebarMenuItem>
              ) : (
                rulebooks.map(file => (
                  <SidebarMenuItem key={file}>
                    <SidebarMenuButton className="text-foreground hover:text-primary">
                      <FileText className="w-4 h-4 mr-2 opacity-70" />
                      <span className="truncate" title={formatName(file)}>{formatName(file)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
