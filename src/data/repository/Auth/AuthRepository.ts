import { createClient } from '@supabase/supabase-js'
import pino from "pino"

const supabaseUrl = 'https://tktwlgreglnqygmbrotu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdHdsZ3JlZ2xucXlnbWJyb3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODM3NzgsImV4cCI6MjA3NTg1OTc3OH0.km1o03WyAXb6IyzZwbAD8R6k1q2c5buzfkCJWzSuARI'
const supabase = createClient(supabaseUrl, supabaseKey)

const logger = pino();

export default class AuthRepositoryImpl {
    static async signUpNewUser(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            logger.error("Error signing up: " + error.message);
            return { data: null, error: error };
        }

        return { data: data, error: null };
    }

    static async signInUser(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            logger.error("Sign-in error: " + error.message);
            return { data: null, error: error };
        }

        logger.info("Sign-in success: " + data.user?.email);
        return { data: data, error: null };
    }

    static async signOutUser() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            logger.error("Error signing out: " + error.message);
            return { error: error };
        }
        return { error: null };
    }
}