"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { playfair } from "@/lib/fonts";

// Google Icon
const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.8055 10.2292C19.8055 9.55057 19.7489 8.86829 19.6292 8.19873H10.2002V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0879V17.5866H16.8264C18.7132 15.845 19.8055 13.2728 19.8055 10.2292Z"
      fill="#4285F4"
    />
    <path
      d="M10.2002 20C12.9512 20 15.2709 19.1045 16.8297 17.5866L13.6058 15.0879C12.7058 15.6979 11.5488 16.0433 10.2034 16.0433C7.55005 16.0433 5.28974 14.2832 4.50974 11.9169H1.19824V14.4927C2.80405 17.6894 6.30986 20 10.2002 20Z"
      fill="#34A853"
    />
    <path
      d="M4.50652 11.9169C4.07431 10.675 4.07431 9.33009 4.50652 8.08817V5.51233H1.19502C-0.259766 8.39447 -0.259766 11.6106 1.19502 14.4927L4.50652 11.9169Z"
      fill="#FBBC04"
    />
    <path
      d="M10.2002 3.95675C11.625 3.936 13.0022 4.47293 14.0467 5.45674L16.8966 2.60673C15.1887 0.990637 12.9367 0.0895352 10.2002 0.11228C6.30986 0.11228 2.80405 2.42283 1.19824 5.51235L4.50974 8.08819C5.28652 5.71848 7.54682 3.95675 10.2002 3.95675Z"
      fill="#EA4335"
    />
  </svg>
);

const EyeIcon = ({
  className = "h-5 w-5 text-brand-lavenderGrey group-focus-within:text-brand-softPeriwinkle transition-colors",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = ({
  className = "h-5 w-5 text-brand-lavenderGrey group-focus-within:text-brand-softPeriwinkle transition-colors",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

const REDIRECT_URL = "/admin";

// Input Field Component
interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const InputField = ({
  id,
  type,
  label,
  value,
  onChange,
  placeholder,
  rightIcon,
  onRightIconClick,
}: InputFieldProps) => (
  <div className="flex flex-col relative group">
    <label
      htmlFor={id}
      className="text-brand-lavenderGrey group-focus-within:text-brand-softPeriwinkle transition-colors text-[11px] uppercase tracking-[0.2em] font-medium mb-3"
    >
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required
        suppressHydrationWarning
        className="w-full bg-transparent border-b py-3 focus:outline-none focus:border-brand-softPeriwinkle transition-colors text-lg lg:text-xl font-light rounded-none placeholder-brand-lavenderGrey/50 border-brand-lightGray text-brand-nearBlack hover:border-brand-lavenderGrey"
        placeholder={placeholder}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          suppressHydrationWarning
          className="absolute inset-y-0 right-0 pr-2 flex items-center justify-center transition-colors"
        >
          {rightIcon}
        </button>
      )}
    </div>
  </div>
);

function SignupPageContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    // Real implementation would use: signIn('google')
    setTimeout(() => {
      setGoogleLoading(false);
      toast.error("Google Sign-In is not configured yet.");
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Automatically sign in the user after successful signup
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Account created, but automatic login failed.");
      } else {
        toast.success("Account created successfully!");
        router.push(REDIRECT_URL);
        router.refresh();
      }
    } catch {
      setError("Unexpected error during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex bg-brand-cream lg:border-t lg:border-brand-lightGray/30 items-center justify-center font-sans">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 p-6 sm:p-0">
        <div className="mb-12 text-center">
          <h1
            className={`text-5xl tracking-tight mb-4 text-brand-nearBlack ${playfair.className}`}
          >
            Create an <span className="italic opacity-90">Account.</span>
          </h1>
          <p className="text-brand-warmGray text-sm md:text-base font-light tracking-wide">
            Please sign up to access the portal.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-rose-400/60 bg-rose-50/50 text-rose-500/90 text-sm italic font-light">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-10">
          <InputField
            id="name"
            type="text"
            label="Full Name *"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            placeholder="John Doe"
          />
          <InputField
            id="email"
            type="email"
            label="Email Address *"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="john@example.com"
          />

          <InputField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password *"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="Create a strong password"
            rightIcon={showPassword ? <EyeIcon /> : <EyeOffIcon />}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />

          <div className="flex items-center justify-end -mt-4">
            <Link
              href="/auth/login"
              className="text-[12px] uppercase tracking-wider text-brand-lavenderGrey hover:text-brand-softPeriwinkle transition-colors"
            >
              Already have an account? Log In
            </Link>
          </div>

          <div className="w-full flex justify-center mt-2">
            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full bg-brand-softPeriwinkle text-white transition-all duration-500 px-12 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.2em] relative overflow-hidden group/btn shadow-[0_4px_20px_rgba(142,148,242,0.3)] hover:shadow-[0_6px_25px_rgba(159,160,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                  {loading ? "Creating Account..." : "Sign Up"}
              </span>
              <div className="absolute inset-0 h-full w-0 bg-brand-wisteriaBlue transition-all duration-500 ease-out group-hover/btn:w-full z-0"></div>
            </button>
          </div>
        </form>

        <div className="my-10 flex items-center gap-4">
          <div className="flex-1 border-t border-brand-lightGray" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-lavenderGrey">
            Or continue with
          </span>
          <div className="flex-1 border-t border-brand-lightGray" />
        </div>

        <div className="w-full flex justify-center">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            suppressHydrationWarning
            className="flex items-center justify-center gap-3 w-full border border-brand-lightGray px-6 py-4 rounded-full hover:border-brand-softPeriwinkle hover:text-brand-softPeriwinkle transition-colors disabled:opacity-50 disabled:cursor-not-allowed group text-brand-nearBlack bg-white"
          >
            <GoogleIcon />
            <span className="text-xs uppercase tracking-[0.15em] transition-colors font-medium">
              Sign up with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-brand-cream">
          <div className="w-8 h-8 rounded-full border-2 border-brand-mauve/30 border-t-brand-softPeriwinkle animate-spin" />
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
