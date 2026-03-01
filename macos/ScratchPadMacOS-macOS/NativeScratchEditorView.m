#import "NativeScratchEditorView.h"

@interface NativeScratchEditorView () <NSTextDelegate>
@property (nonatomic, strong) NSScrollView *scrollView;
@property (nonatomic, strong) NSTextView *textView;
@property (nonatomic, assign) BOOL suppressChangeEvent;
@end

@implementation NativeScratchEditorView

- (NSFont *)resolvedFontWithSize:(CGFloat)size
{
  if (_fontFamily.length > 0) {
    NSFont *customFont = [NSFont fontWithName:_fontFamily size:size];
    if (customFont != nil) {
      return customFont;
    }
  }
  return [NSFont systemFontOfSize:size];
}

- (instancetype)initWithFrame:(NSRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _fontSize = 15;
    _darkMode = NO;
    [self setupScrollView];
    [self setupTextView];
  }
  return self;
}

- (void)setupScrollView
{
  _scrollView = [[NSScrollView alloc] initWithFrame:self.bounds];
  _scrollView.hasVerticalScroller = YES;
  _scrollView.autohidesScrollers = YES;
  _scrollView.drawsBackground = NO;
  _scrollView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
  [self addSubview:_scrollView];
}

- (void)setupTextView
{
  _textView = [[NSTextView alloc] initWithFrame:_scrollView.bounds];

  // Layout
  _textView.verticallyResizable = YES;
  _textView.horizontallyResizable = NO;
  _textView.autoresizingMask = NSViewWidthSizable;
  _textView.textContainer.widthTracksTextView = YES;
  _textView.minSize = NSMakeSize(0, 0);
  _textView.maxSize = NSMakeSize(CGFLOAT_MAX, CGFLOAT_MAX);

  // Text appearance (matches ScratchPad.swift)
  _textView.font = [self resolvedFontWithSize:_fontSize];
  _textView.backgroundColor = [NSColor clearColor];
  _textView.textContainerInset = NSMakeSize(14, 12);
  [self applyTheme];

  // Editing
  _textView.editable = YES;
  _textView.richText = NO;
  _textView.allowsUndo = YES;

  // Disable all autocorrect / spell check
  _textView.automaticSpellingCorrectionEnabled = NO;
  _textView.automaticQuoteSubstitutionEnabled = NO;
  _textView.automaticDashSubstitutionEnabled = NO;
  _textView.automaticTextReplacementEnabled = NO;
  _textView.continuousSpellCheckingEnabled = NO;
  _textView.grammarCheckingEnabled = NO;

  _textView.delegate = self;
  _scrollView.documentView = _textView;

  // Listen for text changes
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(textDidChangeNotification:)
                                               name:NSTextDidChangeNotification
                                             object:_textView];
}

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - Layout

- (void)layout
{
  [super layout];
  _scrollView.frame = self.bounds;
}

#pragma mark - Props

- (void)setText:(NSString *)text
{
  if ([text isEqualToString:_textView.string]) {
    return;
  }
  _text = [text copy];
  _suppressChangeEvent = YES;
  _textView.string = text ?: @"";
  _suppressChangeEvent = NO;
  [self applyTheme];
  [self setNeedsDisplay:YES]; // redraw placeholder if needed
}

- (void)setPlaceholder:(NSString *)placeholder
{
  _placeholder = [placeholder copy];
  [self setNeedsDisplay:YES];
}

- (void)setFontSize:(CGFloat)fontSize
{
  _fontSize = fontSize;
  _textView.font = [self resolvedFontWithSize:fontSize];
  [self applyTheme];
}

- (void)setFontFamily:(NSString *)fontFamily
{
  _fontFamily = [fontFamily copy];
  _textView.font = [self resolvedFontWithSize:_fontSize];
  [self applyTheme];
}

- (void)setDarkMode:(BOOL)darkMode
{
  _darkMode = darkMode;
  [self applyTheme];
  [self setNeedsDisplay:YES];
}

- (void)applyTheme
{
  NSColor *textColor = _darkMode
    ? [NSColor colorWithWhite:0.90 alpha:1.0]
    : [NSColor colorWithWhite:0.12 alpha:1.0];

  // Ensure both existing text and newly typed text follow the active theme.
  _textView.textColor = textColor;
  _textView.insertionPointColor = textColor;

  NSMutableDictionary *typingAttrs = [_textView.typingAttributes mutableCopy];
  if (!typingAttrs) {
    typingAttrs = [NSMutableDictionary dictionary];
  }
  typingAttrs[NSForegroundColorAttributeName] = textColor;
  typingAttrs[NSFontAttributeName] = [self resolvedFontWithSize:_fontSize];
  _textView.typingAttributes = typingAttrs;

  NSRange fullRange = NSMakeRange(0, _textView.string.length);
  if (fullRange.length > 0) {
    [_textView.textStorage addAttribute:NSForegroundColorAttributeName
                                  value:textColor
                                  range:fullRange];
    [_textView.textStorage addAttribute:NSFontAttributeName
                                  value:[self resolvedFontWithSize:_fontSize]
                                  range:fullRange];
  }

  if (_darkMode) {
    _textView.selectedTextAttributes = @{
      NSBackgroundColorAttributeName: [NSColor colorWithWhite:1.0 alpha:0.2],
      NSForegroundColorAttributeName: textColor,
    };
  } else {
    _textView.selectedTextAttributes = @{
      NSBackgroundColorAttributeName: [NSColor selectedTextBackgroundColor],
      NSForegroundColorAttributeName: textColor,
    };
  }
}

#pragma mark - Placeholder Drawing

- (void)drawRect:(NSRect)dirtyRect
{
  [super drawRect:dirtyRect];

  if (_textView.string.length == 0 && _placeholder.length > 0) {
    NSColor *placeholderColor = _darkMode
      ? [NSColor colorWithWhite:0.55 alpha:1.0]
      : [NSColor placeholderTextColor];
    NSDictionary *attrs = @{
      NSFontAttributeName: [self resolvedFontWithSize:_fontSize],
      NSForegroundColorAttributeName: placeholderColor,
    };
    NSRect insetRect = NSInsetRect(self.bounds, 14 + 5, 12); // match textContainerInset + lineFragmentPadding
    [_placeholder drawInRect:insetRect withAttributes:attrs];
  }
}

#pragma mark - Text Change Notification

- (void)textDidChangeNotification:(NSNotification *)notification
{
  if (_suppressChangeEvent) {
    return;
  }
  _text = [_textView.string copy];
  if (_onChange) {
    _onChange(@{@"text": _textView.string ?: @""});
  }
  [self setNeedsDisplay:YES]; // update placeholder visibility
}

@end
