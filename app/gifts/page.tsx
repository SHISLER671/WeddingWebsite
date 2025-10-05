"use client"
import Link from "next/link"
import { ArrowLeft, Heart, Wallet, Palmtree, Leaf, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect } from "react"

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
            className="inline-flex items-center gap-2 text-charcoal hover:text-jewel-crimson transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-charcoal mb-4">Your Presence is Our Present</h1>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto leading-relaxed mb-2">
            Seriously, having you celebrate with us is the best gift we could ask for. But if you'd like to honor us
            with a gift, we've made it super easy with both traditional and modern options.
          </p>
          <p className="text-emerald-700 italic">Island vibes meet future tech 🌺</p>
        </div>

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
              <p className="text-charcoal/80 leading-relaxed">
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
              <p className="text-charcoal/80 leading-relaxed">
                For the crypto-curious or crypto-savvy among you, we've set up an Abstract Global Wallet. It's secure,
                simple, and a cool way to be part of the future of finance with us. Plus, it's way easier than you might
                think!
              </p>
              <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-charcoal/70 leading-relaxed mb-3">
                  Never touched crypto before? No worries! Our wallet system makes it incredibly easy, and we've got a
                  helpful FAQ below to walk you through everything. It's honestly simpler than most apps you use daily.
                </p>
                <div className="bg-white p-3 rounded-md border border-emerald-300 mt-3">
                  <p className="text-xs text-charcoal/60 mb-1 font-medium">Ryan's Abstract Global Wallet Address:</p>
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
                  <p className="text-xs text-charcoal/60 mt-2 italic">
                    Pro tip: Ryan checks this wallet more often than his text messages. Send crypto here and he'll
                    probably see it before you can say "blockchain"! 😄
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-rose-gold/30 shadow-lg bg-white/40 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-charcoal">Crypto Gift Questions</CardTitle>
            <CardDescription>Everything you need to know about gifting with Abstract</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-abstract">
                <AccordionTrigger className="text-left">What even is Abstract?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  Abstract is a modern blockchain platform that makes cryptocurrency actually make sense. It's built on
                  Ethereum tech but designed to be user-friendly, fast, and cheap to use. Think of it as a digital
                  wallet that can hold and send digital money securely - like Venmo, but for the future.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="why-crypto">
                <AccordionTrigger className="text-left">Why accept crypto at a wedding?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  Because we're all about embracing the future while honoring tradition! Cryptocurrency represents
                  innovation, global connectivity, and financial freedom - values we want to carry into our marriage.
                  Plus, we live on a paradise island and love trying new things. It's a fun way to introduce friends and
                  family to this exciting technology!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-send">
                <AccordionTrigger className="text-left">How do I actually send a crypto gift?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  Way easier than you think! After you RSVP, you'll find our Abstract Global Wallet button on the
                  confirmation page. Click it and it'll walk you through everything step by step. You can send popular
                  cryptos like ETH (Ethereum) or stablecoins like USDC. Don't have crypto yet? The wallet can help you
                  buy some directly - no need to figure it out on your own!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="never-used-crypto">
                <AccordionTrigger className="text-left">I've never used crypto. Is it safe?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  Totally safe! Abstract Global Wallet uses bank-level security and encryption. The platform is
                  specifically designed for crypto newbies, with built-in protections and super clear instructions.
                  You'll have full control over your transaction, and everything is transparent and traceable on the
                  blockchain. It's actually more secure than a lot of traditional payment methods!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="what-currencies">
                <AccordionTrigger className="text-left">What cryptocurrencies can I send?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  We accept ETH (Ethereum) and USDC (a stablecoin pegged to the US dollar) on the Abstract network. If
                  you're new to crypto, we recommend USDC since its value stays stable at $1 per coin - makes it super
                  easy to know exactly how much you're gifting. No surprises!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fees">
                <AccordionTrigger className="text-left">Are there fees involved?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  Abstract has super low transaction fees - usually just a few cents, which is one reason we chose this
                  platform. Any fees are clearly shown before you confirm your transaction, so you'll know exactly what
                  you're paying. No hidden costs or surprises!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prefer-cash">
                <AccordionTrigger className="text-left">Can I just give cash instead?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  Of course! We love and appreciate any form of gift, and traditional cash is always wonderful. The
                  crypto option is just an alternative for those who are interested or already use digital currencies.
                  Honestly, your presence at our wedding is what matters most to us. Everything else is just bonus!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="help">
                <AccordionTrigger className="text-left">What if I get stuck or need help?</AccordionTrigger>
                <AccordionContent className="text-charcoal/70 leading-relaxed">
                  We've got you! Chat with Sofia, our AI wedding assistant - she can answer questions about crypto gifts
                  and walk you through the whole process. Find her on the confirmation page after you RSVP, or on the
                  Wedding Details page. She's available 24/7 and super helpful!
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-12 p-6 bg-gradient-to-br from-rose-gold/10 to-emerald-50/30 rounded-lg border border-rose-gold/20">
          <p className="text-charcoal/70 leading-relaxed italic mb-4">
            "The best gift you can give us is your love, laughter, and presence on our special day. Whether you bring
            cash, crypto, or just your amazing self - we're just grateful you're celebrating with us on our island
            paradise."
          </p>
          <p className="text-charcoal font-medium">— Pia & Ryan 🌴💕</p>
        </div>
      </div>
    </div>
  )
}
