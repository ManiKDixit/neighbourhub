import { LoginButton } from '@/src/components/auth/login-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">NeighbourHub</CardTitle>
          <CardDescription>
            Connect with your local community through AI
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <LoginButton />
        </CardContent>
      </Card>
    </div>
  )
}