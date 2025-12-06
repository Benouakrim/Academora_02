import { motion } from 'framer-motion'
import { Lock, Shield, Phone, Mail, MapPin, Github, Linkedin, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FooterSection() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
    ],
    product: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'API Docs', href: '#' },
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Support', href: 'mailto:support@academora.com' },
      { label: 'Community', href: '#' },
      { label: 'Status Page', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR', href: '#' },
    ],
  }

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ]

  const trustBadges = [
    { icon: Shield, label: 'SOC 2 Type II' },
    { icon: Lock, label: 'Bank-Level Encryption' },
    { icon: Shield, label: 'GDPR Compliant' },
  ]

  return (
    <footer className="bg-neutral-900 dark:bg-black text-neutral-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-grid-pattern"></div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="col-span-2 md:col-span-1"
            >
              <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="font-bold text-white text-sm">A</span>
                </div>
                <span className="font-bold text-lg">Academora</span>
              </Link>
              <p className="text-sm text-neutral-400 mb-6">
                Smart university matching powered by AI and real student data.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-primary flex items-center justify-center transition-colors duration-300"
                      title={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </motion.div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (categoryIndex + 1) * 0.1 }}
              >
                <h4 className="font-semibold text-white mb-4 capitalize">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Trust & Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="border-y border-neutral-800 py-8 mb-8"
          >
            <h4 className="font-semibold text-white mb-6">We Keep Your Data Safe</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trustBadges.map((badge) => {
                const Icon = badge.icon
                return (
                  <div
                    key={badge.label}
                    className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700"
                  >
                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{badge.label}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Email</p>
                <a
                  href="mailto:support@academora.com"
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  support@academora.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Support Hours</p>
                <p className="text-sm text-neutral-400">
                  Mon–Fri, 8am–8pm EST
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Headquarters</p>
                <p className="text-sm text-neutral-400">
                  San Francisco, CA
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 bg-neutral-900/50">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-neutral-400 text-center md:text-left">
                © {currentYear} Academora. All rights reserved. | Made with ❤️ for students
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">
                  Sitemap
                </a>
                <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
