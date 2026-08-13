import type { ToolGuide } from '@/types/guide'

export const developerGuides: Record<string, ToolGuide> = {
  'diff-checker': {
    toolId: 'diff-checker',
    introduction: 'The Diff Checker compares two text blocks or code files line-by-line using a Myers Longest Common Subsequence (LCS) algorithm. It highlights added, modified, and deleted lines in side-by-side or unified view formats without transmitting your code to any external server.',
    whatIsIt: {
      title: 'What is Text Diffing?',
      content: [
        'Diffing calculates the minimum set of edit operations (additions, deletions) needed to transform an original text block into a modified text block.',
        'It is the foundation of version control systems like Git (`git diff`), code review platforms, and configuration file auditing.'
      ],
      keyConcepts: [
        { term: 'Myers LCS Algorithm', explanation: 'O(ND) algorithm calculating shortest edit script between two sequences.' },
        { term: 'Unified Diff Format', explanation: 'Single column view showing additions (+), deletions (-), and context lines.' },
        { term: 'Side-by-Side View', explanation: 'Dual column layout displaying original on left and modified on right.' }
      ]
    },
    howItWorks: {
      title: 'How Diff Calculation Works',
      steps: [
        'Splits original and modified text inputs into line arrays.',
        'Executes Myers LCS algorithm to find identical matching line subsequences.',
        'Categorizes non-matching lines as added (+), removed (-), or changed.',
        'Calculates summary statistics (total additions, deletions, unchanged lines).'
      ]
    },
    howToUse: {
      title: 'How to Compare Text & Code',
      steps: [
        'Paste original text in left box.',
        'Paste modified text in right box.',
        'Toggle ignore options (whitespace, case sensitivity).',
        'Click Compare.',
        'Switch between Side-by-Side and Unified views.'
      ]
    },
    examples: [
      {
        title: 'Comparing Code Modification',
        input: 'Original: return false\nModified: return true',
        output: '- return false\n+ return true',
        explanation: 'Shows red deletion line and green addition line.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Diff Results',
      fields: [
        { name: 'Added Lines (+)', type: 'Green Highlight', description: 'Lines present only in modified text.' },
        { name: 'Removed Lines (-)', type: 'Red Highlight', description: 'Lines present only in original text.' },
        { name: 'Stats Breakdown', type: 'Counts', description: 'Total line addition and deletion counts.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Comparing Code with Mixed Indentation (Tabs vs Spaces)',
        description: 'Differing indentation characters trigger false line differences on every line.',
        badExample: 'Comparing tab-indented file with space-indented file without ignoring whitespace.',
        goodExample: 'Enable "Ignore Whitespace" option.'
      }
    ],
    bestPractices: [
      'Enable "Ignore Whitespace" when comparing refactored code blocks.'
    ],
    useCases: [
      { title: 'Configuration Auditing', description: 'Compare active Nginx/Kubernetes config against backup file.' },
      { title: 'Code Review Pre-check', description: 'Verify local code edits before creating Git pull requests.' }
    ],
    troubleshooting: [
      { problem: 'Too many differences highlighted', cause: 'Windows (CRLF) vs Unix (LF) line ending mismatches.', solution: 'Normalize line endings.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Executed entirely in browser memory. Source code is never sent to external servers.' },
    faq: [
      { question: 'What is unified diff format?', answer: 'Unified diff displays changes inline with + and - markers instead of separate side-by-side columns.' }
    ],
    technicalReferences: [
      { title: 'An O(ND) Difference Algorithm and Its Variations (Eugene W. Myers)', url: 'https://citeseerx.ist.psu.edu/doc/10.1.1.4.6927', description: 'Original paper on the Myers diff algorithm.' }
    ],
    summary: 'Diff checking provides instant line-by-line comparison for code and configuration files.'
  },

  'cron-generator': {
    toolId: 'cron-generator',
    introduction: 'The Cron Generator helps developers and DevOps engineers build and decode standard Linux 5-field cron schedule expressions. It generates human-readable explanations (e.g. "Every Monday at 9:00 AM") and provides instant field validation.',
    whatIsIt: {
      title: 'What is a Cron Expression?',
      content: [
        'Cron is a time-based job scheduler in Unix-like operating systems.',
        'A standard cron expression consists of 5 fields separated by whitespace: Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6, 0=Sunday).'
      ],
      keyConcepts: [
        { term: '*', explanation: 'Wildcard meaning "every" interval.' },
        { term: '*/N', explanation: 'Step values meaning "every N units" (e.g. */15 = every 15 minutes).' },
        { term: 'a-b', explanation: 'Range of values (e.g. 1-5 = Monday through Friday).' },
        { term: 'a,b', explanation: 'Value list (e.g. 0,12 = at 0:00 and 12:00).' }
      ]
    },
    howItWorks: {
      title: 'How Cron Generation Works',
      steps: [
        'Reads 5 input fields: min, hour, dom, month, dow.',
        'Parses special symbols (*, /, -, ,).',
        'Translates expression into clear natural language sentence.',
        'Calculates upcoming execution schedule.'
      ]
    },
    howToUse: {
      title: 'How to Build Cron Schedules',
      steps: [
        'Select a quick preset (e.g. "Every 5 minutes" or "Weekdays at 9 AM").',
        'Or manually edit Minute, Hour, Day of Month, Month, and Day of Week fields.',
        'Read human-readable sentence explanation.',
        'Copy cron expression string.'
      ]
    },
    examples: [
      {
        title: 'Weekdays at 9:00 AM',
        input: '0 9 * * 1-5',
        output: 'At 09:00 AM, Monday through Friday',
        explanation: 'Minute 0, Hour 9, Day of Week 1-5 (Mon-Fri).'
      },
      {
        title: 'Every 15 Minutes',
        input: '*/15 * * * *',
        output: 'Every 15 minutes',
        explanation: 'Step operator /15 in minute field.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Cron Syntax',
      fields: [
        { name: 'Minute (Field 1)', type: '0-59', description: 'Exact minute of the hour.' },
        { name: 'Hour (Field 2)', type: '0-23', description: '24-hour hour of the day.' },
        { name: 'Day of Month (Field 3)', type: '1-31', description: 'Day of the calendar month.' },
        { name: 'Month (Field 4)', type: '1-12', description: 'Month of the year.' },
        { name: 'Day of Week (Field 5)', type: '0-6', description: 'Day of the week (0=Sunday, 6=Saturday).' }
      ]
    },
    commonMistakes: [
      {
        title: 'Confusing 5-field Linux Cron with 6/7-field Quartz Cron',
        description: 'Standard Linux cron uses 5 fields (no seconds field). Java Quartz cron uses 6 or 7 fields starting with seconds.',
        badExample: '0 0 9 * * ? (6-field Quartz syntax in crontab file)',
        goodExample: '0 9 * * * (5-field standard Linux crontab syntax)'
      }
    ],
    bestPractices: [
      'Avoid scheduling heavy background jobs at exactly midnight (0 0 * * *) to prevent server load spikes.'
    ],
    useCases: [
      { title: 'System Backup Scheduling', description: 'Schedule database dumps every night at 2:00 AM (0 2 * * *).' }
    ],
    troubleshooting: [
      { problem: 'Cron job not running', cause: 'Environment PATH variables missing in crontab.', solution: 'Use absolute binary paths (e.g. /usr/bin/python3).' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Executed locally in browser memory.' },
    faq: [
      { question: 'Is 0 or 7 Sunday in cron?', answer: 'In standard crontab, both 0 and 7 represent Sunday.' }
    ],
    technicalReferences: [
      { title: 'crontab(5) - Linux Manual Page', url: 'https://man7.org/linux/man-pages/man5/crontab.5.html', description: 'Official Linux crontab manual.' }
    ],
    summary: 'Cron expression building simplifies setting up automated background tasks.'
  },

  'chmod-calculator': {
    toolId: 'chmod-calculator',
    introduction: 'The Linux chmod Calculator computes numeric octal (e.g. 755, 644) and symbolic notation (e.g. rwxr-xr-x) for Unix/Linux file permissions. It includes interactive checkboxes for Owner, Group, and Others, as well as special bits (SUID, SGID, Sticky Bit).',
    whatIsIt: {
      title: 'What are Linux File Permissions?',
      content: [
        'Linux controls file access using 3 permission types (Read=4, Write=2, Execute=1) assigned across 3 user classes (Owner, Group, Others).'
      ],
      keyConcepts: [
        { term: 'Read (r = 4)', explanation: 'Permission to view file contents or list directory contents.' },
        { term: 'Write (w = 2)', explanation: 'Permission to modify file contents or add/remove files in directory.' },
        { term: 'Execute (x = 1)', explanation: 'Permission to execute binary program or traverse directory.' },
        { term: 'Octal Value', explanation: 'Sum of r+w+x bit values for each group (e.g. 4+2+1 = 7).' }
      ]
    },
    howItWorks: {
      title: 'How chmod Calculation Works',
      steps: [
        'Sums bit weights (4 for Read, 2 for Write, 1 for Execute) for Owner, Group, and Others.',
        'Calculates 3-digit or 4-digit octal number.',
        'Generates 10-character symbolic string (e.g. -rwxr-xr-x).'
      ]
    },
    howToUse: {
      title: 'How to Calculate chmod Values',
      steps: [
        'Toggle Read, Write, and Execute checkboxes for Owner, Group, and Others.',
        'Or type an octal value (e.g. 755) in the input box.',
        'Copy generated octal number, symbolic string, or shell command (`chmod 755 file`).'
      ]
    },
    examples: [
      {
        title: 'Standard Web File Permissions (644)',
        input: 'Owner: r+w, Group: r, Others: r',
        output: 'Numeric: 644\nSymbolic: -rw-r--r--\nCommand: chmod 644 filename',
        explanation: 'Owner can read and write; everyone else can only read.'
      },
      {
        title: 'Executable Script Permissions (755)',
        input: 'Owner: r+w+x, Group: r+x, Others: r+x',
        output: 'Numeric: 755\nSymbolic: -rwxr-xr-x\nCommand: chmod 755 script.sh',
        explanation: 'Allows execution for all users while protecting write rights.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Output',
      fields: [
        { name: 'Octal Numeric', type: '3/4 Digit String', description: 'Numerical permission value (e.g. 755).' },
        { name: 'Symbolic String', type: '10 Character String', description: 'Unix ls -l style string (-rwxr-xr-x).' },
        { name: 'Command', type: 'Shell String', description: 'Ready-to-run terminal command.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Setting 777 Permissions on Public Files',
        description: 'chmod 777 gives write access to all unprivileged system users, creating severe security vulnerabilities.',
        badExample: 'chmod 777 /var/www/html/config.php',
        goodExample: 'chmod 640 /var/www/html/config.php'
      }
    ],
    bestPractices: [
      'Use 644 for public web files and 755 for web directories.',
      'Use 600 for SSH private keys (~/.ssh/id_rsa).'
    ],
    useCases: [
      { title: 'SSH Key Security Fix', description: 'Fix "Permissions 0777 for id_rsa are too open" error using `chmod 600 ~/.ssh/id_rsa`.' }
    ],
    troubleshooting: [
      { problem: 'Permission denied', cause: 'Missing execute bit (+x) on shell script file.', solution: 'Run `chmod +x script.sh`.' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Executed locally in browser.' },
    faq: [
      { question: 'What is the sticky bit (1777)?', answer: 'Sticky bit on directory (like /tmp) prevents users from deleting files owned by others.' }
    ],
    technicalReferences: [
      { title: 'chmod(1) - Linux Manual Page', url: 'https://man7.org/linux/man-pages/man1/chmod.1.html', description: 'Linux manual page for chmod command.' }
    ],
    summary: 'chmod calculation simplifies understanding Unix permission octals and command syntax.'
  }
}
