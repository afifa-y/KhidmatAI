CREATE TYPE "public"."availability_status" AS ENUM('available', 'busy', 'offline');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_status_type" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('CONFIRMATION', 'REMINDER', 'COMPLETION');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('electrician', 'plumber', 'ac_technician', 'tutor', 'beautician', 'carpenter', 'painter', 'cleaner', 'other');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingCode" varchar(32) NOT NULL,
	"sessionId" varchar(64),
	"userId" integer,
	"providerId" integer NOT NULL,
	"serviceType" varchar(64) NOT NULL,
	"taskDescription" text,
	"userLocationText" varchar(256),
	"userLatitude" real,
	"userLongitude" real,
	"scheduledTime" varchar(128),
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"llmReasoning" text,
	"estimatedCost" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_bookingCode_unique" UNIQUE("bookingCode")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(64) NOT NULL,
	"messages" json DEFAULT '[]'::json NOT NULL,
	"extractedIntent" json,
	"stage" text DEFAULT 'initial' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookingId" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"message" text NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"status" "notification_status_type" DEFAULT 'PENDING' NOT NULL,
	"sentAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(320),
	"category" "service_category" NOT NULL,
	"specialty" text DEFAULT '' NOT NULL,
	"locationText" varchar(256) NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"hourlyRate" integer DEFAULT 0 NOT NULL,
	"availabilityStatus" "availability_status" DEFAULT 'available' NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"yearsExperience" integer DEFAULT 0 NOT NULL,
	"totalJobsDone" integer DEFAULT 0 NOT NULL,
	"avatarUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"providerId" integer NOT NULL,
	"bookingId" integer,
	"reviewerName" varchar(64) DEFAULT 'Anonymous',
	"rating" integer NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_providerId_providers_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_providerId_providers_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;