-- CreateTable
CREATE TABLE "Lessor" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'LANDLORD',
    "otpCode" TEXT,
    "otpExpires" TIMESTAMP(3),

    CONSTRAINT "Lessor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lessor_email_key" ON "Lessor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lessor_phone_key" ON "Lessor"("phone");
