-- CreateTable
CREATE TABLE "_DealContacts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DealContacts_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DealContacts_B_fkey" FOREIGN KEY ("B") REFERENCES "Deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_DealContacts_AB_unique" ON "_DealContacts"("A", "B");

-- CreateIndex
CREATE INDEX "_DealContacts_B_index" ON "_DealContacts"("B");
