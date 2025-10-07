"use client"
import Link from "next/link"
import { ArrowLeft, Heart, Wallet, Palmtree, Leaf, Copy, Flower2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useLoginWithAbstract } from "@abstract-foundation/agw-react"

export default function GiftsPage() {
  const [copied, setCopied] = useState(false)
  const groomAddress = "0x7674171719Ab79b8C0048aa8405BC2E76AF97d0D"

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(groomAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/IMG-20251005-WA0012.jpg)" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-start mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-800 hover:text-jewel-crimson transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">Your Presence is Our Present</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-2">
            Seriously, having you celebrate with us is the best gift we could ask for. But if you'd like to honor us
            with a gift, we've made it super easy with both traditional and modern options.
          </p>
          <p className="text-emerald-700 italic">Island vibes meet future tech 🌺</p>
        </div>

        {/* Handmade Art Appreciation - MOVED TO TOP */}
        <Card className="border-jewel-gold/30 shadow-lg bg-white/40 backdrop-blur-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jewel-gold">
              <Palmtree className="w-5 h-5" />
              Handmade Art & Crafts
            </CardTitle>
            <CardDescription>Your creativity means the world to us</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-800 leading-relaxed">
              We would <strong>super appreciate any handmade art you created!</strong> Whether it's a painting, drawing, 
              pottery, jewelry, or any other craft you've poured your heart into - we'd love to have a piece of your 
              creativity as part of our home. <em>There's something so special about gifts made with love and personal touch.</em>
            </p>
            <p className="text-gray-700 text-sm italic">
              Bring your handmade treasures to the wedding, or let us know if you'd like to coordinate delivery. 
              We can't wait to see what beautiful things you've created! 🎨✨
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 mb-12">
          <Card className="border-jewel-crimson/20 shadow-lg bg-white/40 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-jewel-crimson">
                <Heart className="w-5 h-5" />
                Traditional Cash Gifts
              </CardTitle>
              <CardDescription>The classic way - always appreciated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-800 leading-relaxed">
                We happily accept cash gifts, which will help us build our future together (and maybe fund a few island
                adventures!). Bring your gift to the wedding, or if you prefer, we can share bank transfer details.
                Whatever works best for you!
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-400/20 shadow-lg bg-white/40 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Wallet className="w-5 h-5" />
                Crypto Gifts via Abstract
              </CardTitle>
              <CardDescription>A modern way to celebrate our future</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-800 leading-relaxed">
                For the crypto-curious or crypto-savvy among you, we've set up an Abstract Global Wallet. It's secure,
                simple, and a cool way to be part of the future of finance with us. Plus, it's way easier than you might
                think!
              </p>
              <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Never touched crypto before? No worries! Our wallet system makes it incredibly easy, and we've got a
                  helpful FAQ below to walk you through everything. It's honestly simpler than most apps you use daily.
                </p>
                <div className="bg-white p-3 rounded-md border border-emerald-300 mt-3">
                  <p className="text-xs text-gray-600 mb-1 font-medium">Ryan's Abstract Global Wallet Address:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-emerald-800 font-mono break-all flex-1">{groomAddress}</code>
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 p-2 hover:bg-emerald-100 rounded transition-colors"
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-emerald-600 mt-1">Copied! 🎉</p>}
                  <p className="text-xs text-gray-600 mt-2 italic">
                    Pro tip: Ryan checks this wallet more often than his text messages. Send crypto here and he'll
                    probably see it before you can say "blockchain"! 😄
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Connect Button */}
        <Card className="border-jewel-purple/30 shadow-lg bg-white/40 backdrop-blur-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jewel-purple">
              <Flower2 className="w-5 h-5" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>Get ready for a special digital surprise after the wedding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-800 leading-relaxed">
              Connect your Abstract Global Wallet and we'll send you a <strong>special digital surprise after the wedding!</strong> 
              It's our way of saying thanks for celebrating with us. <em>Plus, it's way cooler than it sounds - promise!</em>
            </p>
            <div className="flex justify-center">
              <AGWWalletButton />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Important:</strong> After connecting your wallet above, please go back and 
                <strong> edit your RSVP entry</strong> so we can save your wallet address in our database. 
                <em>Don't worry - this is read-only access only, we cannot make any transactions on your wallet!</em>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-gold/30 shadow-lg bg-white/40 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Crypto Gift Questions</CardTitle>
            <CardDescription>Everything you need to know about gifting with Abstract</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-abstract">
                <AccordionTrigger className="text-left">What even is Abstract?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Abstract is a modern blockchain platform that makes cryptocurrency actually make sense. It's built on
                  Ethereum tech but designed to be user-friendly, fast, and cheap to use. Think of it as a digital
                  wallet that can hold and send digital money securely - like Venmo, but for the future.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="why-crypto">
                <AccordionTrigger className="text-left">Why accept crypto at a wedding?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Because we're all about embracing the future while honoring tradition! Cryptocurrency represents
                  innovation, global connectivity, and financial freedom - values we want to carry into our marriage.
                  Plus, we live on a paradise island and love trying new things. It's a fun way to introduce friends and
                  family to this exciting technology!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-send">
                <AccordionTrigger className="text-left">How do I actually send a crypto gift?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Way easier than you think! After you RSVP, you'll find our Abstract Global Wallet button on the
                  confirmation page. Click it and it'll walk you through everything step by step. You can send popular
                  cryptos like ETH (Ethereum) or stablecoins like USDC. Don't have crypto yet? The wallet can help you
                  buy some directly - no need to figure it out on your own!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="never-used-crypto">
                <AccordionTrigger className="text-left">I've never used crypto. Is it safe?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Totally safe! Abstract Global Wallet uses bank-level security and encryption. The platform is
                  specifically designed for crypto newbies, with built-in protections and super clear instructions.
                  You'll have full control over your transaction, and everything is transparent and traceable on the
                  blockchain. It's actually more secure than a lot of traditional payment methods!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-currencies">
                <AccordionTrigger className="text-left">What cryptocurrencies can I send?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  We accept ETH (Ethereum) and USDC (a stablecoin pegged to the US dollar) on the Abstract network. If
                  you're new to crypto, we recommend USDC since its value stays stable at $1 per coin - makes it super
                  easy to know exactly how much you're gifting. No surprises!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fees">
                <AccordionTrigger className="text-left">Are there fees involved?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Abstract has super low transaction fees - usually just a few cents, which is one reason we chose this
                  platform. Any fees are clearly shown before you confirm your transaction, so you'll know exactly what
                  you're paying. No hidden costs or surprises!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prefer-cash">
                <AccordionTrigger className="text-left">Can I just give cash instead?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Of course! We love and appreciate any form of gift, and traditional cash is always wonderful. The
                  crypto option is just an alternative for those who are interested or already use digital currencies.
                  Honestly, your presence at our wedding is what matters most to us. Everything else is just bonus!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="help">
                <AccordionTrigger className="text-left">What if I get stuck or need help?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  We've got you! Chat with Jahmal, our AI wedding assistant - he can answer questions about crypto gifts
                  and walk you through the whole process. Find him on the confirmation page after you RSVP, or on the
                  Wedding Details page. He's available 24/7 and super helpful!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* AGW Wallet FAQ */}
        <Card className="border-jewel-purple/30 shadow-lg bg-white/40 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-jewel-purple">Abstract Global Wallet Questions</CardTitle>
            <CardDescription>Everything you need to know about connecting your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-agw">
                <AccordionTrigger className="text-left">What's Abstract Global Wallet?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  Think of it as a <strong>digital wallet for the future</strong> - like Venmo or PayPal, but built on blockchain
                  technology. <em>It's super user-friendly and designed for people who've never touched crypto before.</em>
                  No complicated tech jargon, no confusing setup. <strong>Just a simple, secure way to hold digital assets.</strong>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="why-agw">
                <AccordionTrigger className="text-left">Why are you using Abstract Global Wallet?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  We're mixing tradition with a little tech magic! <strong>Connect your wallet when you RSVP, and we'll send you a special digital surprise after the wedding.</strong> 
                  It's our way of saying thanks for celebrating with us. <em>Plus, it's way cooler than it sounds - promise!</em>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-connect">
                <AccordionTrigger className="text-left">How do I connect this thing?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  <strong>Super easy!</strong> Click the <strong>"Connect Wallet" button above</strong> and Abstract Global Wallet will walk you through everything. 
                  If you don't have a wallet yet, it'll create one for you automatically. <strong>No forms, no hassle - just click and you're done!</strong>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="never-used-crypto">
                <AccordionTrigger className="text-left">I've never used crypto. Will I look dumb?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  <strong>Not at all!</strong> Abstract Global Wallet is literally designed for crypto newbies. <em>You don't need to
                  understand blockchain or buy any cryptocurrency.</em> Just click the button and follow the super simple
                  prompts. <strong>It's honestly easier than setting up most apps on your phone. Takes less than a minute!</strong>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="auto-create">
                <AccordionTrigger className="text-left">
                  Does it make a wallet for me automatically?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  <strong>Yep!</strong> If you don't already have an Abstract Global Wallet, the system creates one for you when you
                  click <strong>"Connect Wallet."</strong> <em>You'll get your own unique wallet address that's securely linked to your
                  account.</em> No paperwork, no verification emails - it just works. <strong>Like magic, but real.</strong>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="is-it-safe">
                <AccordionTrigger className="text-left">Is this safe? I don't want to get hacked.</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  <strong>Totally safe!</strong> Abstract Global Wallet uses <strong>bank-level security and encryption.</strong> Your wallet is
                  protected by advanced cryptography, and only you have access to it. <em>We never see your private
                  keys, and everything is transparent on the blockchain.</em> <strong>It's actually more secure than most
                  traditional payment methods!</strong>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-surprise">
                <AccordionTrigger className="text-left">What's this "digital surprise" you keep mentioning?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  <strong>That's the fun part - it's a surprise!</strong> <em>All we can say is that it's something special we're creating
                  just for our wedding guests who connect their wallets.</em> Think of it as a modern take on wedding favors - 
                  digital, unique, and something you can keep forever. <strong>Trust us, it'll be worth the click!</strong>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="do-i-have-to">
                <AccordionTrigger className="text-left">Do I HAVE to do this?</AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  <strong>Nope! It's 100% optional.</strong> Your RSVP is totally valid whether you connect a wallet or not. <em>We just
                  wanted to offer this as a fun, modern option for anyone interested.</em> <strong>Your presence at our wedding
                  is what matters most to us.</strong> Everything else is just bonus!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-12 p-6 bg-gradient-to-br from-rose-gold/10 to-emerald-50/30 rounded-lg border border-rose-gold/20">
          <p className="text-gray-700 leading-relaxed italic mb-4">
            "The best gift you can give us is your love, laughter, and presence on our special day. Whether you bring
            cash, crypto, or just your amazing self - we're just grateful you're celebrating with us on our island
            paradise."
          </p>
          <p className="text-gray-800 font-medium">— Pia & Ryan 🌴💕</p>
        </div>
      </div>
    </div>
  )
}

function AGWWalletButton() {
  const { address, status, isConnected } = useAccount()
  const { login, logout } = useLoginWithAbstract()

  const handleConnect = async () => {
    try {
      await login()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  return (
    <button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={status === "connecting"}
      className="flex flex-col items-center gap-3 p-6 bg-jewel-purple hover:bg-jewel-burgundy text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Flower2 className="w-8 h-8 text-white" />
      <span className="font-semibold text-lg text-white">
        {status === "connecting" ? "Connecting..." : isConnected ? "Disconnect" : "Connect Wallet"}
      </span>
      <span className="text-sm opacity-90 text-center text-white">Abstract Global Wallet</span>
    </button>
  )
}
